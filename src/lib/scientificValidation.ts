import { DiagramConcept, DiagramValidationResult, ValidationStatus } from '../types';
import { CANONICAL_DIAGRAM_SPECIFICATIONS } from './scientificDiagramRegistry';

/**
 * ============================================================================
 * SCIENTIFIC DIAGRAM VALIDATION & REGRESSION TEST ENGINE
 * Enforces anatomical ontology, bans biological misconceptions, and validates anchors
 * ============================================================================
 */

export const GLOBAL_FORBIDDEN_TERMS: { pattern: RegExp; reason: string }[] = [
  {
    pattern: /nucleolus\s*\(\s*endosome\s*\)/i,
    reason: 'Nucleolus is a subnuclear rRNA transcription body, whereas an endosome is a cytoplasmic membrane-bound vesicle. Conflating them is anatomically invalid.'
  },
  {
    pattern: /endometrium\s*\(\s*myometrium\s*\)/i,
    reason: 'Endometrium (mucosal lining) and Myometrium (smooth muscle wall) are distinct histological tissue layers.'
  },
  {
    pattern: /fallopian\s*tube\s*\(\s*ovary\s*\)/i,
    reason: 'Fallopian tube is a muscular conduit; ovary is the primary endocrine gonad.'
  }
];

/**
 * Validates a DiagramConcept against canonical ontology and coordinate rules.
 */
export function validateDiagramConcept(concept: DiagramConcept): DiagramValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const forbiddenTermViolations: string[] = [];

  if (!concept) {
    return {
      isValid: false,
      status: 'draft',
      errors: ['Concept is null or undefined'],
      warnings: [],
      validatedStructureCount: 0,
      forbiddenTermViolations: []
    };
  }

  // 1. Check Global Forbidden Terms in all text fields
  const allText = [
    concept.title,
    concept.subtitle,
    concept.description,
    ...(concept.pins || []).map(p => `${p.name} ${p.category} ${p.functionSummary} ${p.detailedNotes}`)
  ].join(' ');

  for (const { pattern, reason } of GLOBAL_FORBIDDEN_TERMS) {
    if (pattern.test(allText)) {
      const match = allText.match(pattern)?.[0] || 'forbidden term';
      errors.push(`Critical Misconception: ${reason} (Found: "${match}")`);
      forbiddenTermViolations.push(match);
    }
  }

  // 2. Check Concept-Specific Forbidden Terms from specification
  const spec = CANONICAL_DIAGRAM_SPECIFICATIONS[concept.diagramType];
  if (spec && spec.forbiddenTerms) {
    for (const term of spec.forbiddenTerms) {
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (regex.test(allText)) {
        errors.push(`Forbidden term violation for ${spec.title}: "${term}"`);
        forbiddenTermViolations.push(term);
      }
    }
  }

  // 3. Validate Pin Coordinates and Counts
  const pins = concept.pins || [];
  if (pins.length === 0) {
    errors.push('Diagram contains no label pins.');
  }

  let validPinCount = 0;
  for (const pin of pins) {
    if (!pin.name || pin.name.trim().length === 0) {
      errors.push(`Pin ${pin.id || pin.number} is missing a valid anatomical name.`);
      continue;
    }

    if (typeof pin.x !== 'number' || typeof pin.y !== 'number' || isNaN(pin.x) || isNaN(pin.y)) {
      errors.push(`Pin "${pin.name}" has invalid coordinates (x: ${pin.x}, y: ${pin.y}).`);
      continue;
    }

    if (pin.x < 0 || pin.x > 100 || pin.y < 0 || pin.y > 100) {
      errors.push(`Pin "${pin.name}" coordinates (${pin.x}%, ${pin.y}%) are outside 0-100% canvas boundaries.`);
      continue;
    }

    validPinCount++;
  }

  // 4. Specification Concordance Check
  if (spec) {
    // Check for required canonical structures
    const requiredStructures = spec.structures.filter(s => s.required);
    for (const req of requiredStructures) {
      const found = pins.some(p => 
        p.id === req.id || 
        p.name.toLowerCase().includes(req.canonicalName.toLowerCase()) ||
        (req.aliases && req.aliases.some(a => p.name.toLowerCase().includes(a.toLowerCase())))
      );
      if (!found) {
        warnings.push(`Recommended standard structure "${req.canonicalName}" is omitted in current plate.`);
      }
    }
  }

  // 5. Determine Truthful Status
  let status: ValidationStatus = 'draft';
  if (errors.length > 0) {
    status = 'draft';
  } else if (spec) {
    status = 'ontology-validated';
  } else if (concept.diagramType === 'custom-concept' || concept.isAiGeneratedFallback) {
    status = 'custom-unverified';
  } else {
    status = 'ontology-validated';
  }

  return {
    isValid: errors.length === 0,
    status,
    errors,
    warnings,
    validatedStructureCount: validPinCount,
    forbiddenTermViolations
  };
}

/**
 * Executes an in-memory regression test over the canonical database.
 */
export function runScientificRegressionTests(): { passed: boolean; totalTests: number; failures: string[] } {
  const failures: string[] = [];
  let totalTests = 0;

  for (const [key, spec] of Object.entries(CANONICAL_DIAGRAM_SPECIFICATIONS)) {
    totalTests++;

    // Test 1: Title and Category
    if (!spec.title || !spec.category || !spec.domain) {
      failures.push(`[${key}] Missing metadata (title, category, or domain)`);
    }

    // Test 2: Source references present
    if (!spec.sources || spec.sources.length === 0) {
      failures.push(`[${key}] Missing academic source references`);
    }

    // Test 3: Structures and anchors
    if (!spec.structures || spec.structures.length === 0) {
      failures.push(`[${key}] No canonical structures defined`);
    }

    for (const struct of spec.structures || []) {
      totalTests++;
      // Check anchor coordinates
      if (struct.anchor.x < 5 || struct.anchor.x > 95 || struct.anchor.y < 5 || struct.anchor.y > 95) {
        failures.push(`[${key} -> ${struct.id}] Anchor (${struct.anchor.x}, ${struct.anchor.y}) is too close to edge or out of bounds.`);
      }

      // Check forbidden patterns
      for (const { pattern, reason } of GLOBAL_FORBIDDEN_TERMS) {
        if (pattern.test(struct.canonicalName) || pattern.test(struct.detailedNotes)) {
          failures.push(`[${key} -> ${struct.id}] Violated global term rule: ${reason}`);
        }
      }
    }
  }

  return {
    passed: failures.length === 0,
    totalTests,
    failures
  };
}
