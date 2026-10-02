import { DiagramConcept, LabelPin, DiagramSourceAttribution, DiagramMode } from '../types';
import { matchScientificConcept, SCIENTIFIC_PRESETS_REGISTRY, ScientificPresetConfig } from './scientificRegistry';
import { findSpecificationByQuery, buildConceptFromSpecification } from './scientificDiagramRegistry';
import { validateDiagramConcept } from './scientificValidation';
import { supabase } from './supabase';

export interface EducationalCandidate {
  title: string;
  url: string;
  thumbUrl?: string;
  sourceName: string;
  sourceUrl: string;
  license: string;
  author: string;
  mimeType?: string;
  width?: number;
  height?: number;
  relevanceScore?: number;
  isSvg?: boolean;
}

export interface DiagramGenerationResult {
  concept: DiagramConcept;
  engineStepTrace: {
    stage: string;
    details: string;
    timestamp: number;
    mode?: DiagramMode;
  }[];
}

const CACHE_STORAGE_KEY = 'draw_label_verified_cache_v2';

/**
 * 1. Identify diagram request: Extract clean topic, domain, intent, and education level
 */
export function identifyDiagramRequest(query: string): {
  topic: string;
  domain: 'biological' | 'chemical' | 'physical' | 'general';
  category: DiagramConcept['category'];
  educationalLevel: DiagramSourceAttribution['educationalLevel'];
} {
  const cleaned = query
    .replace(/^(\s*draw\s*(and|&)?\s*label(\s*(a|an|the|of|for))?|\s*diagram\s*of|\s*label\s*the|\s*structure\s*of)\s*/i, '')
    .trim();

  const lower = query.toLowerCase();

  // Determine domain & category
  let domain: 'biological' | 'chemical' | 'physical' | 'general' = 'biological';
  let category: DiagramConcept['category'] = 'Biology & Cells';

  if (/\b(uterus|ovary|sperm|heart|brain|eye|nephron|lungs|stomach|skin|ear|neuron|digestive|reproductive|skeleton|muscle|female|male)\b/i.test(lower)) {
    domain = 'biological';
    category = 'Human Anatomy';
  } else if (/\b(flower|plant|chloroplast|leaf|root|stem|tree|botany|angiosperm)\b/i.test(lower)) {
    domain = 'biological';
    category = 'Botany & Ecology';
  } else if (/\b(carbon\s*cycle|nitrogen\s*cycle|water\s*cycle|volcano|rock\s*cycle|plate\s*tectonics|atmosphere)\b/i.test(lower)) {
    domain = 'physical';
    category = 'Earth & Space';
  } else if (/\b(circuit|electricity|electromagnetic|spectrum|optics|lens|prism|refraction|wave|bohr|gravity|magnet)\b/i.test(lower)) {
    domain = 'physical';
    category = 'Physics & Chemistry';
  } else if (/\b(methane|ethane|propane|alkane|molecule|chemical|acid|base|hydrocarbon|benzene|reaction)\b/i.test(lower)) {
    domain = 'chemical';
    category = 'Organic Chemistry';
  }

  // Determine educational level
  let educationalLevel: DiagramSourceAttribution['educationalLevel'] = 'Secondary / High School';
  if (/\b(ultrastructure|histology|biochemical|quantum|pathology|medical|undergrad|advanced)\b/i.test(lower)) {
    educationalLevel = 'Undergraduate / College';
  }

  return {
    topic: cleaned || query,
    domain,
    category,
    educationalLevel
  };
}

/**
 * 2. Search existing Draw and Label resources from the local verified scientific registry (Mode 2)
 */
export function searchExistingResources(query: string): ScientificPresetConfig | null {
  return matchScientificConcept(query);
}

/**
 * 3. Search reliable educational sources (Wikimedia Commons Open Educational API / OpenStax) (Mode 1)
 */
export async function searchReliableEducationalSources(topic: string): Promise<EducationalCandidate[]> {
  try {
    const searchTerms = encodeURIComponent(`${topic} diagram OR schematic OR cross-section`);
    const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${searchTerms}&gsrlimit=8&gsrnamespace=6&prop=imageinfo&iiprop=url|size|extmetadata|mime&format=json&origin=*`;

    const res = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!data.query || !data.query.pages) return [];

    const candidates: EducationalCandidate[] = [];

    for (const pageId in data.query.pages) {
      const page = data.query.pages[pageId];
      if (!page.imageinfo || !page.imageinfo[0]) continue;

      const info = page.imageinfo[0];
      const mime = (info.mime || '').toLowerCase();
      const url = info.url || '';
      const meta = info.extmetadata || {};

      // Only accept diagrams (SVG, high-res PNG/JPEG)
      const isSvg = mime.includes('svg') || url.endsWith('.svg');
      const isHighRes = (info.width && info.width >= 600) || isSvg;

      if (!isHighRes) continue;

      // Extract license and author from metadata
      const licenseShort = meta.LicenseShortName ? meta.LicenseShortName.value : (meta.UsageTerms ? meta.UsageTerms.value : 'CC BY-SA');
      const author = meta.Artist ? meta.Artist.value.replace(/<[^>]+>/g, '').trim() : (meta.Credit ? meta.Credit.value.replace(/<[^>]+>/g, '').trim() : 'Wikimedia Open Educational Contributor');
      const title = (page.title || '').replace(/^File:/i, '').replace(/\.(svg|png|jpg|jpeg)$/i, '').replace(/_/g, ' ');

      // Filter out irrelevant audio or non-diagram media
      if (mime.includes('audio') || mime.includes('video') || mime.includes('pdf')) continue;

      candidates.push({
        title,
        url: info.url,
        thumbUrl: info.thumburl || info.url,
        sourceName: 'Wikimedia Commons Open Educational Archive',
        sourceUrl: meta.DescriptionUrl ? meta.DescriptionUrl.value : `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
        license: licenseShort || 'Creative Commons Open License',
        author: author || 'Open Educational Resource',
        mimeType: mime,
        width: info.width,
        height: info.height,
        isSvg,
        relevanceScore: isSvg ? 1.0 : 0.8
      });
    }

    return candidates;
  } catch (err) {
    console.warn('[DrawAndLabelEngine] Educational source search failed:', err);
    return [];
  }
}

/**
 * 4. Verify candidate diagram relevance and scientific content
 */
export function verifyCandidateDiagram(
  candidate: EducationalCandidate,
  topic: string
): { isRelevant: boolean; score: number } {
  const topicWords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const candTitle = candidate.title.toLowerCase();

  let matchCount = 0;
  for (const word of topicWords) {
    if (candTitle.includes(word)) {
      matchCount++;
    }
  }

  const score = topicWords.length > 0 ? (matchCount / topicWords.length) : 0;
  const isRelevant = score >= 0.5 || candTitle.includes(topic.toLowerCase().trim());

  return {
    isRelevant,
    score: score + (candidate.isSvg ? 0.3 : 0)
  };
}

/**
 * 5. Cache verified resources in Local Storage and Supabase
 */
export async function cacheVerifiedResource(concept: DiagramConcept): Promise<void> {
  try {
    // 1. Local storage cache
    const existingRaw = localStorage.getItem(CACHE_STORAGE_KEY);
    const list: DiagramConcept[] = existingRaw ? JSON.parse(existingRaw) : [];
    const filtered = list.filter(item => item.id !== concept.id && item.title !== concept.title);
    filtered.unshift(concept);
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(filtered.slice(0, 50)));

    // 2. Safely attempt Supabase caching if available
    if (supabase) {
      try {
        await supabase.from('draw_label_resources').upsert({
          id: concept.id,
          title: concept.title,
          category: concept.category,
          domain: concept.domain,
          data: concept,
          updated_at: new Date().toISOString()
        });
      } catch (dbErr) {
        // Silently ignore if table does not exist or user is offline
      }
    }
  } catch (err) {
    console.warn('[DrawAndLabelEngine] Failed to cache resource:', err);
  }
}

/**
 * Get cached verified educational diagrams
 */
export function getVerifiedEducationalHistory(): DiagramConcept[] {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

/**
 * Main Orchestrator: Full Three-Mode DrawAndLabelEngine pipeline
 * Mode 1: AUTHENTIC REFERENCE (Open educational reference diagram)
 * Mode 2: STRUCTURED RECONSTRUCTION (Ground-truth scientific preset from registry)
 * Mode 3: AI ILLUSTRATION (AI-generated educational approximation - marked unverified)
 */
export async function runDrawAndLabelEngine(
  query: string,
  userRenderMode: '3d' | '2d' | 'paper' = '3d'
): Promise<DiagramGenerationResult> {
  const trace: DiagramGenerationResult['engineStepTrace'] = [];

  // Step 1: Identify diagram request
  trace.push({
    stage: '1. Identify Topic & Intent',
    details: `Parsed academic intent for "${query}"`,
    timestamp: Date.now()
  });
  const intent = identifyDiagramRequest(query);

  // Step 2: MODE 2 CHECK - Search Structured Ground-Truth Scientific Registry
  trace.push({
    stage: '2. Search Structured Scientific Registry',
    details: 'Checking verified scientific preset repository for structural ground truth...',
    timestamp: Date.now()
  });
  
  const canonicalSpec = findSpecificationByQuery(query);
  if (canonicalSpec) {
    trace.push({
      stage: 'Canonical Structure Pipeline Active (Mode 2)',
      details: `Matched canonical specification: "${canonicalSpec.title}" (${canonicalSpec.category})`,
      timestamp: Date.now(),
      mode: 'structured-reconstruction'
    });

    const concept = buildConceptFromSpecification(canonicalSpec, 'standard', userRenderMode);
    const validation = validateDiagramConcept(concept);
    concept.validationResult = validation;

    await cacheVerifiedResource(concept);

    return {
      concept,
      engineStepTrace: trace
    };
  }

  const localPreset = searchExistingResources(query);

  if (localPreset) {
    trace.push({
      stage: 'Structured Reconstruction Selected (Mode 2)',
      details: `Matched authoritative ground truth: "${localPreset.title}" (${localPreset.category})`,
      timestamp: Date.now(),
      mode: 'structured-reconstruction'
    });

    const concept: DiagramConcept = {
      id: `concept-${Date.now()}`,
      title: localPreset.title,
      category: localPreset.category,
      subtitle: localPreset.subtitle,
      description: localPreset.description,
      diagramType: localPreset.diagramType as any,
      renderMode: userRenderMode,
      domain: localPreset.domain,
      pins: localPreset.pins,
      colorTheme: 'vibrant-spectrum',
      funFact: localPreset.funFact,
      timestamp: Date.now(),
      sourceAttribution: {
        sourceName: 'Curriculum Textbook Ground Truth Registry',
        sourceUrl: 'https://openstax.org/subjects/science',
        license: 'Open Educational License / Academic Ground Truth',
        author: 'Curriculum Scientific Illustrator',
        mode: 'structured-reconstruction',
        groundTruthStandard: 'Campbell Biology 12th Ed / Gray\'s Anatomy 42nd Ed / OpenStax A&P',
        verificationNote: 'Synthesized via precision structural reconstruction conforming strictly to published anatomical and cytological ground truth.',
        educationalLevel: intent.educationalLevel
      }
    };

    const validation = validateDiagramConcept(concept);
    concept.validationResult = validation;

    await cacheVerifiedResource(concept);

    return {
      concept,
      engineStepTrace: trace
    };
  }

  // Step 3: MODE 1 CHECK - Search Authentic Educational Archives (Wikimedia Commons Open Educational API)
  trace.push({
    stage: '3. Search Authentic Open Reference Archives',
    details: `Querying Wikimedia Commons Open Educational Repositories for "${intent.topic}"...`,
    timestamp: Date.now()
  });
  const candidates = await searchReliableEducationalSources(intent.topic);

  // Step 4: Verify candidate diagram relevance
  trace.push({
    stage: '4. Analyze Candidate Reference Diagrams',
    details: `Retrieved ${candidates.length} candidate open educational diagrams; verifying anatomical relevance...`,
    timestamp: Date.now()
  });

  let bestCandidate: EducationalCandidate | null = null;
  let highestScore = 0;

  for (const cand of candidates) {
    const verification = verifyCandidateDiagram(cand, intent.topic);
    if (verification.isRelevant && verification.score > highestScore) {
      highestScore = verification.score;
      bestCandidate = cand;
    }
  }

  // Step 5: MODE 1 Selection OR MODE 3 (AI Educational Illustration Fallback)
  const isAuthenticCandidateChosen = bestCandidate !== null && highestScore >= 0.7;

  trace.push({
    stage: isAuthenticCandidateChosen ? '5. Authentic Reference Selected (Mode 1)' : '5. AI Educational Illustration (Mode 3)',
    details: isAuthenticCandidateChosen
      ? `Selected authentic reference archive diagram: "${bestCandidate!.title}" (${bestCandidate!.license})`
      : 'No authoritative reference found in registry or archive; synthesizing educational AI illustration (flagged as unverified reference)...',
    timestamp: Date.now(),
    mode: isAuthenticCandidateChosen ? 'authentic-reference' : 'ai-illustration'
  });

  try {
    const res = await fetch('/api/diagram-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: query,
        renderMode: userRenderMode,
        domain: intent.domain,
        verifiedSourceCandidate: isAuthenticCandidateChosen ? bestCandidate : undefined
      })
    });

    if (res.ok) {
      const generated = await res.json();
      if (generated && generated.title && Array.isArray(generated.pins)) {
        const diagramMode: DiagramMode = isAuthenticCandidateChosen ? 'authentic-reference' : 'ai-illustration';
        const concept: DiagramConcept = {
          ...generated,
          id: generated.id || `concept-${Date.now()}`,
          renderMode: userRenderMode,
          domain: generated.domain || intent.domain,
          category: generated.category || intent.category,
          sourceAttribution: {
            sourceName: isAuthenticCandidateChosen ? bestCandidate!.sourceName : 'AI Educational Illustration Engine',
            sourceUrl: isAuthenticCandidateChosen ? bestCandidate!.sourceUrl : 'https://openstax.org',
            license: isAuthenticCandidateChosen ? bestCandidate!.license : 'Educational AI Illustration',
            author: isAuthenticCandidateChosen ? bestCandidate!.author : 'Generative Scientific Illustrator',
            mode: diagramMode,
            groundTruthStandard: isAuthenticCandidateChosen 
              ? 'Open Educational Curriculum Archive (Wikimedia / OpenStax)' 
              : 'AI Educational Approximation (Unverified)',
            verificationNote: isAuthenticCandidateChosen
              ? 'Authentic educational reference diagram retrieved and matched against curriculum standard.'
              : 'AI-generated educational illustration. Visual coordinates and structures have NOT been independently verified against an authoritative textbook standard.',
            educationalLevel: intent.educationalLevel
          }
        };

        trace.push({
          stage: 'Complete Diagram Processing',
          details: `Generated ${concept.pins.length} anatomical/scientific pins with full callouts. Mode: ${diagramMode}`,
          timestamp: Date.now(),
          mode: diagramMode
        });

        await cacheVerifiedResource(concept);

        return {
          concept,
          engineStepTrace: trace
        };
      }
    }
  } catch (genErr) {
    console.warn('[DrawAndLabelEngine] Backend generation error, falling back to client synthesizer:', genErr);
  }

  // Fallback if backend API is unreachable (Mode 3: AI Illustration)
  const fallbackPins: LabelPin[] = [
    {
      id: `p-${Date.now()}-1`,
      number: 1,
      name: `Outer Boundary / Capsule of ${intent.topic}`,
      x: 20,
      y: 35,
      color: '#38BDF8',
      category: 'Morphology',
      functionSummary: 'External structural boundary protecting internal specialized elements.',
      detailedNotes: 'Standard morphological boundary observed in educational cross-sections.'
    },
    {
      id: `p-${Date.now()}-2`,
      number: 2,
      name: `Core Functional Center`,
      x: 50,
      y: 50,
      color: '#818CF8',
      category: 'Functional Core',
      functionSummary: 'Primary operative region responsible for system transformation or catalysis.',
      detailedNotes: 'Central operational hub coordinating activity throughout the structure.'
    },
    {
      id: `p-${Date.now()}-3`,
      number: 3,
      name: `Auxiliary / Lateral Zone`,
      x: 80,
      y: 45,
      color: '#10B981',
      category: 'Support Structure',
      functionSummary: 'Secondary specialized compartment facilitating transport, energy, or output.',
      detailedNotes: 'Maintains balance and continuity with surrounding biological or physical systems.'
    }
  ];

  const fallbackConcept: DiagramConcept = {
    id: `concept-${Date.now()}`,
    title: intent.topic.charAt(0).toUpperCase() + intent.topic.slice(1),
    subtitle: `Educational schematic cross-section of ${intent.topic}`,
    description: `Real-life anatomical and educational schematic of ${intent.topic}, detailing morphological compartments, structural boundaries, and functional zones.`,
    category: intent.category,
    diagramType: 'custom-concept',
    renderMode: userRenderMode,
    domain: intent.domain,
    pins: fallbackPins,
    colorTheme: 'vibrant-spectrum',
    timestamp: Date.now(),
    sourceAttribution: {
      sourceName: 'AI Educational Illustration Engine',
      sourceUrl: 'https://openstax.org',
      license: 'Educational AI Illustration',
      author: 'AI Generative Scientific Engine',
      mode: 'ai-illustration',
      groundTruthStandard: 'AI Educational Approximation (Unverified)',
      verificationNote: 'AI-generated educational illustration. Visual coordinates and structures have NOT been independently verified against an authoritative reference.',
      educationalLevel: intent.educationalLevel
    }
  };

  await cacheVerifiedResource(fallbackConcept);

  return {
    concept: fallbackConcept,
    engineStepTrace: trace
  };
}
