
export type NodeType = 
  | 'source-upload' 
  | 'source-generate'
  | 'source-imagescript'
  | 'op-style' 
  | 'op-3d'
  | 'op-edit'
  | 'op-resize'
  // Creative Tools
  | 'op-prompt-magic'
  // Surreal & Whimsical Styles
  | 'op-dreamscape'
  | 'op-storybook'
  | 'op-glitchmancy'
  // Artistic Styles
  | 'op-oil-painting'
  | 'op-watercolor'
  | 'op-pencil-sketch'
  | 'op-charcoal-drawing'
  | 'op-comic-book'
  | 'op-pop-art'
  | 'op-impressionism'
  | 'op-abstract'
  | 'op-pointillism'
  | 'op-stained-glass'
  // Photographic Effects
  | 'op-vintage-photo'
  | 'op-bw'
  | 'op-long-exposure'
  | 'op-bokeh'
  | 'op-hdr'
  | 'op-duotone'
  | 'op-pinhole'
  | 'op-lomo'
  | 'op-tilt-shift'
  | 'op-night-vision'
  // Digital Transformations
  | 'op-pixelate'
  | 'op-glitch'
  | 'op-kaleidoscope'
  | 'op-ascii'
  | 'op-low-poly'
  | 'op-halftone'
  | 'op-anaglyph'
  | 'op-scanlines'
  | 'op-invert'
  | 'op-liquify'
  // Thematic Styles
  | 'op-cyberpunk'
  | 'op-steampunk'
  | 'op-fantasy'
  | 'op-sci-fi'
  | 'op-minimalist'
  | 'op-vaporwave'
  | 'op-gothic'
  | 'op-art-deco'
  | 'op-grunge'
  | 'op-hologram'
  // Creative Additions
  | 'op-stickerize'
  | 'op-lego'
  | 'op-claymation'
  | 'op-blueprint'
  | 'op-neon-glow'
  // Multimedia Generation
  | 'op-generate-podcast'
  | 'op-veo-video';

export interface LintError {
  line: number;
  message: string;
}

export interface NodeData {
  // For all nodes
  id: string;
  type: NodeType;
  position: { x: number; y: number };

  // Data properties
  data: {
    prompt?: string;
    basePrompt?: string; // For chained operations
    stylePrompt?: string;
    aspectRatio?: string;
    script?: string; // For podcast node
    videoGenComplete?: boolean; // For VEO video node
    enhancedPrompt?: string; // For creative boost node
    imageScript?: string; // For ImageScript node

    inputImageUrl?: string; // e.g., for uploaded images
    inputImageMimeType?: string;
    
    outputImageUrl?: string;
    isLoading?: boolean;
    error?: string;
  };
}

export interface Edge {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface MenuState {
  x: number;
  y: number;
  type: 'initial' | 'operation';
  parentNodeId: string | null;
}

export type AppMode = 'flow' | 'design';