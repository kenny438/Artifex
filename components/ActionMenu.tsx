
import React from 'react';
import type { MenuState, NodeType } from '../types';
import { 
    UploadIcon, SparklesIcon, MagicWandIcon, CubeIcon, PencilIcon, FrameIcon, 
    PaintBrushIcon, CameraIcon, SwirlIcon, PlanetIcon, FaceSmileIcon,
    MicrophoneIcon, VideoCameraIcon, BrainCircuitIcon, MoonIcon, BookOpenIcon, CodeBracketIcon, FilmIcon
} from './Icons';

interface ActionMenuProps {
  menuState: MenuState;
  onSelect: (type: NodeType) => void;
  onClose: () => void;
}

const MenuSection: React.FC<{ title: string }> = ({ title }) => (
    <h3 className="px-3 pt-2 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</h3>
);

const ActionMenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
  >
    <span className="w-6 h-6 mr-3 text-slate-500">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

const ActionMenu: React.FC<ActionMenuProps> = ({ menuState, onSelect, onClose }) => {
  const handleSelect = (type: NodeType) => {
    onSelect(type);
    onClose();
  };

  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
        onClose();
    };

    window.addEventListener('keydown', handleEsc);
    setTimeout(() => window.addEventListener('mousedown', handleClickOutside), 0);

    return () => {
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const menuContent = {
    initial: [
      { type: 'source-upload' as NodeType, label: 'Upload Image', icon: <UploadIcon /> },
      { type: 'source-generate' as NodeType, label: 'Generate (Prompt)', icon: <SparklesIcon /> },
      { type: 'source-imagescript' as NodeType, label: 'Generate (ImageScript)', icon: <CodeBracketIcon /> },
    ],
    operation: {
      core: [
        { type: 'op-edit' as NodeType, label: 'Edit Image', icon: <PencilIcon /> },
        { type: 'op-resize' as NodeType, label: 'Resize & Reframe', icon: <FrameIcon /> },
        { type: 'op-style' as NodeType, label: 'Change Style (Custom)', icon: <MagicWandIcon /> },
        { type: 'op-3d' as NodeType, label: 'Make 3D', icon: <CubeIcon /> },
      ],
      creativeAI: [
        { type: 'op-prompt-magic' as NodeType, label: 'Creative Boost', icon: <BrainCircuitIcon /> },
        { type: 'op-generate-podcast' as NodeType, label: 'Generate Podcast', icon: <MicrophoneIcon /> },
        { type: 'op-veo-video' as NodeType, label: 'Generate Video (Veo)', icon: <VideoCameraIcon /> },
      ],
      surreal: [
        { type: 'op-dreamscape' as NodeType, label: 'Dreamscape', icon: <MoonIcon /> },
        { type: 'op-storybook' as NodeType, label: 'Storybook', icon: <BookOpenIcon /> },
        { type: 'op-glitchmancy' as NodeType, label: 'Artistic Glitch', icon: <SwirlIcon /> },
      ],
      artistic: [
        { type: 'op-oil-painting' as NodeType, label: 'Oil Painting', icon: <PaintBrushIcon /> },
        { type: 'op-watercolor' as NodeType, label: 'Watercolor', icon: <PaintBrushIcon /> },
        { type: 'op-pencil-sketch' as NodeType, label: 'Pencil Sketch', icon: <PaintBrushIcon /> },
        { type: 'op-charcoal-drawing' as NodeType, label: 'Charcoal Drawing', icon: <PaintBrushIcon /> },
        { type: 'op-comic-book' as NodeType, label: 'Comic Book', icon: <PaintBrushIcon /> },
        { type: 'op-pop-art' as NodeType, label: 'Pop Art', icon: <PaintBrushIcon /> },
        { type: 'op-impressionism' as NodeType, label: 'Impressionism', icon: <PaintBrushIcon /> },
        { type: 'op-abstract' as NodeType, label: 'Abstract', icon: <PaintBrushIcon /> },
        { type: 'op-pointillism' as NodeType, label: 'Pointillism', icon: <PaintBrushIcon /> },
        { type: 'op-stained-glass' as NodeType, label: 'Stained Glass', icon: <PaintBrushIcon /> },
      ],
      photographic: [
        { type: 'op-vintage-photo' as NodeType, label: 'Vintage Photo', icon: <CameraIcon /> },
        { type: 'op-bw' as NodeType, label: 'Black & White', icon: <CameraIcon /> },
        { type: 'op-long-exposure' as NodeType, label: 'Long Exposure', icon: <CameraIcon /> },
        { type: 'op-bokeh' as NodeType, label: 'Bokeh', icon: <CameraIcon /> },
        { type: 'op-hdr' as NodeType, label: 'HDR', icon: <CameraIcon /> },
        { type: 'op-duotone' as NodeType, label: 'Duotone', icon: <CameraIcon /> },
        { type: 'op-pinhole' as NodeType, 'label': 'Pinhole Camera', icon: <CameraIcon /> },
        { type: 'op-lomo' as NodeType, label: 'Lomography', icon: <CameraIcon /> },
        { type: 'op-tilt-shift' as NodeType, label: 'Tilt-Shift', icon: <CameraIcon /> },
        { type: 'op-night-vision' as NodeType, label: 'Night Vision', icon: <CameraIcon /> },
      ],
      transformations: [
        { type: 'op-pixelate' as NodeType, label: 'Pixelate', icon: <SwirlIcon /> },
        { type: 'op-glitch' as NodeType, label: 'Glitch Art', icon: <SwirlIcon /> },
        { type: 'op-kaleidoscope' as NodeType, label: 'Kaleidoscope', icon: <SwirlIcon /> },
        { type: 'op-ascii' as NodeType, label: 'ASCII Art', icon: <SwirlIcon /> },
        { type: 'op-low-poly' as NodeType, label: 'Low Poly', icon: <SwirlIcon /> },
        { type: 'op-halftone' as NodeType, label: 'Halftone', icon: <SwirlIcon /> },
        { type: 'op-anaglyph' as NodeType, label: 'Anaglyph 3D', icon: <SwirlIcon /> },
        { type: 'op-scanlines' as NodeType, label: 'Scanlines', icon: <SwirlIcon /> },
        { type: 'op-invert' as NodeType, label: 'Invert Colors', icon: <SwirlIcon /> },
        { type: 'op-liquify' as NodeType, label: 'Liquify', icon: <SwirlIcon /> },
      ],
      thematic: [
        { type: 'op-cyberpunk' as NodeType, label: 'Cyberpunk', icon: <PlanetIcon /> },
        { type: 'op-steampunk' as NodeType, label: 'Steampunk', icon: <PlanetIcon /> },
        { type: 'op-fantasy' as NodeType, label: 'Fantasy', icon: <PlanetIcon /> },
        { type: 'op-sci-fi' as NodeType, label: 'Sci-Fi', icon: <PlanetIcon /> },
        { type: 'op-minimalist' as NodeType, label: 'Minimalist', icon: <PlanetIcon /> },
        { type: 'op-vaporwave' as NodeType, label: 'Vaporwave', icon: <PlanetIcon /> },
        { type: 'op-gothic' as NodeType, label: 'Gothic', icon: <PlanetIcon /> },
        { type: 'op-art-deco' as NodeType, label: 'Art Deco', icon: <PlanetIcon /> },
        { type: 'op-grunge' as NodeType, label: 'Grunge', icon: <PlanetIcon /> },
        { type: 'op-hologram' as NodeType, label: 'Hologram', icon: <PlanetIcon /> },
      ],
      creativeAdditions: [
        { type: 'op-stickerize' as NodeType, label: 'Stickerize', icon: <FaceSmileIcon /> },
        { type: 'op-lego' as NodeType, label: 'Lego Bricks', icon: <FaceSmileIcon /> },
        { type: 'op-claymation' as NodeType, label: 'Claymation', icon: <FaceSmileIcon /> },
        { type: 'op-blueprint' as NodeType, label: 'Blueprint', icon: <FaceSmileIcon /> },
        { type: 'op-neon-glow' as NodeType, label: 'Neon Glow', icon: <FaceSmileIcon /> },
      ]
    },
  };

  return (
    <div
      className="absolute bg-white rounded-xl shadow-2xl shadow-slate-300/40 border border-slate-200/80 p-2 w-64 animate-pop-in max-h-[80vh] overflow-y-auto"
      style={{ left: menuState.x, top: menuState.y, zIndex: 50 }}
      onMouseDown={(e) => e.stopPropagation()}
    >
        {menuState.type === 'initial' ? (
            <div className="flex flex-col space-y-1">
                {menuContent.initial.map(item => (
                    <ActionMenuItem key={item.type} icon={item.icon} label={item.label} onClick={() => handleSelect(item.type)} />
                ))}
            </div>
        ) : (
            <div className="flex flex-col">
                <MenuSection title="Core Tools" />
                {menuContent.operation.core.map(item => <ActionMenuItem key={item.type} icon={item.icon} label={item.label} onClick={() => handleSelect(item.type)} />)}

                <MenuSection title="Creative AI" />
                {menuContent.operation.creativeAI.map(item => <ActionMenuItem key={item.type} icon={item.icon} label={item.label} onClick={() => handleSelect(item.type)} />)}
                
                <MenuSection title="Surreal & Whimsical" />
                {menuContent.operation.surreal.map(item => <ActionMenuItem key={item.type} icon={item.icon} label={item.label} onClick={() => handleSelect(item.type)} />)}

                <MenuSection title="Artistic Styles" />
                {menuContent.operation.artistic.map(item => <ActionMenuItem key={item.type} icon={item.icon} label={item.label} onClick={() => handleSelect(item.type)} />)}

                <MenuSection title="Photographic" />
                {menuContent.operation.photographic.map(item => <ActionMenuItem key={item.type} icon={item.icon} label={item.label} onClick={() => handleSelect(item.type)} />)}

                <MenuSection title="Digital Transformations" />
                {menuContent.operation.transformations.map(item => <ActionMenuItem key={item.type} icon={item.icon} label={item.label} onClick={() => handleSelect(item.type)} />)}
                
                <MenuSection title="Thematic Styles" />
                {menuContent.operation.thematic.map(item => <ActionMenuItem key={item.type} icon={item.icon} label={item.label} onClick={() => handleSelect(item.type)} />)}

                <MenuSection title="Creative Additions" />
                {menuContent.operation.creativeAdditions.map(item => <ActionMenuItem key={item.type} icon={item.icon} label={item.label} onClick={() => handleSelect(item.type)} />)}
            </div>
        )}
    </div>
  );
};

export default ActionMenu;
