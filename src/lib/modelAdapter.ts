import { InternalEditPlan, ReferenceFidelityMode, ImageEditMode } from '../types';

export interface ModelCapabilities {
  supportsImageToImage: boolean;
  supportsReferenceImage: boolean;
  supportsFaceIdentityConditioning: boolean;
  supportsBackgroundReplacement: boolean;
  supportsMasking: boolean;
  supportsNegativePrompt: boolean;
  maxResolution: string;
  recommendedFidelityMode: ReferenceFidelityMode;
  description: string;
}

export const MODEL_CAPABILITIES: Record<string, ModelCapabilities> = {
  'magic-hour': {
    supportsImageToImage: true,
    supportsReferenceImage: true,
    supportsFaceIdentityConditioning: true,
    supportsBackgroundReplacement: true,
    supportsMasking: true,
    supportsNegativePrompt: true,
    maxResolution: '4K',
    recommendedFidelityMode: 'high',
    description: 'Direct reference preservation, subject extraction, and identity conditioning engine'
  },
  'gemini-3.1-flash-image': {
    supportsImageToImage: true,
    supportsReferenceImage: true,
    supportsFaceIdentityConditioning: true,
    supportsBackgroundReplacement: true,
    supportsMasking: false,
    supportsNegativePrompt: false,
    maxResolution: '2K',
    recommendedFidelityMode: 'high',
    description: 'Multimodal reference-conditioned vision model'
  },
  'gemini-3-pro-image': {
    supportsImageToImage: true,
    supportsReferenceImage: true,
    supportsFaceIdentityConditioning: true,
    supportsBackgroundReplacement: true,
    supportsMasking: false,
    supportsNegativePrompt: false,
    maxResolution: '4K',
    recommendedFidelityMode: 'high',
    description: 'High-resolution multimodal reference-conditioned engine'
  },
  'replicate-flux-dev': {
    supportsImageToImage: true,
    supportsReferenceImage: true,
    supportsFaceIdentityConditioning: false,
    supportsBackgroundReplacement: false,
    supportsMasking: false,
    supportsNegativePrompt: false,
    maxResolution: '2K',
    recommendedFidelityMode: 'balanced',
    description: 'FLUX.1 Dev with image-to-image strength control'
  },
  'puter-flux': {
    supportsImageToImage: false,
    supportsReferenceImage: false,
    supportsFaceIdentityConditioning: false,
    supportsBackgroundReplacement: false,
    supportsMasking: false,
    supportsNegativePrompt: false,
    maxResolution: '1K',
    recommendedFidelityMode: 'creative',
    description: 'Text-to-image engine'
  },
  'pollinations-flux': {
    supportsImageToImage: false,
    supportsReferenceImage: false,
    supportsFaceIdentityConditioning: false,
    supportsBackgroundReplacement: false,
    supportsMasking: false,
    supportsNegativePrompt: true,
    maxResolution: '1K',
    recommendedFidelityMode: 'creative',
    description: 'Serverless text-to-image engine'
  },
  'together-flux': {
    supportsImageToImage: false,
    supportsReferenceImage: false,
    supportsFaceIdentityConditioning: false,
    supportsBackgroundReplacement: false,
    supportsMasking: false,
    supportsNegativePrompt: false,
    maxResolution: '1K',
    recommendedFidelityMode: 'creative',
    description: 'Text-to-image engine'
  },
  'huggingface-flux': {
    supportsImageToImage: false,
    supportsReferenceImage: false,
    supportsFaceIdentityConditioning: false,
    supportsBackgroundReplacement: false,
    supportsMasking: false,
    supportsNegativePrompt: false,
    maxResolution: '1K',
    recommendedFidelityMode: 'creative',
    description: 'Text-to-image engine'
  }
};

/**
 * Builds an Internal Structured Edit Plan from user configuration
 */
export function buildInternalEditPlan({
  userPrompt,
  editMode = 'background_change',
  fidelityMode = 'high',
  faceLock = true,
  lockComplexion = true,
  lockAttire = true,
  complexionText = '',
  attireText = '',
  style = 'Nexora Vision Pro',
  aspectRatio = '1:1',
  quality = '1K'
}: {
  userPrompt: string;
  editMode?: ImageEditMode;
  fidelityMode?: ReferenceFidelityMode;
  faceLock?: boolean;
  lockComplexion?: boolean;
  lockAttire?: boolean;
  complexionText?: string;
  attireText?: string;
  style?: string;
  aspectRatio?: string;
  quality?: string;
}): InternalEditPlan {
  const isStylized = /cartoon|stick|pixar|sketch|drawing|watercolor|oil painting|claymation|papercraft|origami|anime/i.test(style);
  const blurExplicitlyRequested = /blur(red)? background|bokeh|shallow depth of field|depth-of-field|soft focus/i.test(userPrompt);

  return {
    fidelityMode,
    editType: editMode,
    preserve: {
      identity: faceLock,
      faceStructure: faceLock,
      skinTone: lockComplexion,
      hairStyle: true,
      attire: lockAttire,
      bodyProportions: true,
      photographicDetail: true
    },
    modifications: {
      background: editMode === 'background_change' || editMode === 'scene_change' ? userPrompt : undefined,
      pose: editMode === 'posture_change' ? userPrompt : undefined,
      attireChanges: !lockAttire ? attireText : undefined
    },
    style: {
      name: style,
      isStylized
    },
    output: {
      aspectRatio,
      quality,
      blurBackground: blurExplicitlyRequested
    }
  };
}
