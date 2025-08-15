
import React, { useState, useCallback } from 'react';
import type { NodeData, Edge, MenuState, NodeType, AppMode } from './types';
import Node from './components/Node';
import ActionMenu from './components/ActionMenu';
import Connector from './components/Connector';
import ImageScriptDocs from './components/ImageScriptDocs';
import DesignCanvas from './components/DesignCanvas';
import ModeToggle from './components/ModeToggle';
import { PlusIcon, XMarkIcon } from './components/Icons';

const App: React.FC = () => {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [menuState, setMenuState] = useState<MenuState | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [mode, setMode] = useState<AppMode>('flow');

  const handleOpenInitialMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuState({ x: e.clientX, y: e.clientY, type: 'initial', parentNodeId: null });
  };
  
  const handleAddNextNode = useCallback((parentNodeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const parentNodeRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuState({ x: parentNodeRect.right + 20, y: parentNodeRect.top, type: 'operation', parentNodeId });
  }, []);

  const handleCloseMenu = () => {
    setMenuState(null);
  };
  
  const handleAddNode = useCallback((type: NodeType) => {
    const newNodeId = `node-${Date.now()}`;
    let position = { x: menuState?.x || 100, y: menuState?.y || 100 };
    let parentNode: NodeData | undefined;

    if (menuState?.parentNodeId) {
      parentNode = nodes.find(n => n.id === menuState.parentNodeId);
      if(parentNode) {
        position = {
            x: parentNode.position.x + 350,
            y: parentNode.position.y
        };
      }
    }

    const newNode: NodeData = {
      id: newNodeId,
      type,
      position,
      data: {
          basePrompt: parentNode?.data.outputImageUrl ? parentNode?.data.basePrompt : undefined, // Carry over prompt only if parent has output
          inputImageUrl: parentNode?.data.outputImageUrl,
      },
    };

    setNodes(prev => [...prev, newNode]);

    if (menuState?.parentNodeId) {
      const newEdge: Edge = {
        id: `edge-${menuState.parentNodeId}-${newNodeId}`,
        sourceId: menuState.parentNodeId,
        targetId: newNodeId,
      };
      setEdges(prev => [...prev, newEdge]);
    }

  }, [menuState, nodes]);

  const updateNodeData = useCallback((id: string, data: Partial<NodeData['data']>) => {
    setNodes(prevNodes =>
      prevNodes.map(n =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      )
    );
  }, []);
  
  const handleNodeDrag = useCallback((id:string, newPosition: {x: number, y: number}) => {
    setNodes(prev => prev.map(n => n.id === id ? {...n, position: newPosition} : n));
  }, []);

  const findDescendants = useCallback((startNodeId: string) => {
    const descendants = new Set<string>();
    const queue: string[] = [startNodeId];
    const visited = new Set<string>([startNodeId]);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const childrenEdges = edges.filter(e => e.sourceId === currentId);
      for (const edge of childrenEdges) {
        if (!visited.has(edge.targetId)) {
          visited.add(edge.targetId);
          descendants.add(edge.targetId);
          queue.push(edge.targetId);
        }
      }
    }
    return descendants;
  }, [edges]);
  
  const handleDeleteNode = useCallback((startNodeId: string) => {
    const nodesToDelete = new Set<string>([startNodeId]);
    const descendants = findDescendants(startNodeId);
    descendants.forEach(id => nodesToDelete.add(id));
    
    setNodes(currentNodes => currentNodes.filter(n => !nodesToDelete.has(n.id)));
    setEdges(currentEdges => currentEdges.filter(e => !nodesToDelete.has(e.sourceId) && !nodesToDelete.has(e.targetId)));
  }, [findDescendants]);

  const handleRegenerate = useCallback((parentNodeId: string) => {
    const nodesToDelete = findDescendants(parentNodeId);
    if (nodesToDelete.size > 0) {
        setNodes(currentNodes => currentNodes.filter(n => !nodesToDelete.has(n.id)));
        setEdges(currentEdges => currentEdges.filter(e => !nodesToDelete.has(e.sourceId) && !nodesToDelete.has(e.targetId)));
    }
  }, [findDescendants]);
  
  const getNodeById = (id: string) => nodes.find(n => n.id === id);

  return (
    <div className="w-screen h-screen bg-slate-50 text-slate-900 overflow-hidden relative" onContextMenu={mode === 'flow' ? handleOpenInitialMenu : (e) => e.preventDefault()}>
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.08) 1px, transparent 0)',
          backgroundSize: '25px 25px',
        }}
      ></div>

      <ModeToggle mode={mode} onToggle={setMode} />

      {/* Flow View */}
      <div className={`w-full h-full absolute inset-0 transition-all duration-300 ease-in-out ${mode === 'flow' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="relative w-full h-full">
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <div className="text-center">
                   <h1 className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 to-sky-500">Artiffex</h1>
                   <p className="text-slate-500 mt-2 max-w-md">A visual canvas to generate and transform images with AI. Right-click or use the button to begin.</p>
               </div>
               <button
                  onClick={(e) => { e.stopPropagation(); handleOpenInitialMenu(e); }}
                  className="mt-8 w-16 h-16 bg-white border border-slate-200/80 rounded-full flex items-center justify-center text-indigo-500 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:shadow-indigo-500/30 active:scale-100 pointer-events-auto"
                  aria-label="Add first node"
                >
                  <PlusIcon className="w-8 h-8"/>
              </button>
            </div>
          )}

          {edges.map(edge => {
              const sourceNode = getNodeById(edge.sourceId);
              const targetNode = getNodeById(edge.targetId);
              if (!sourceNode || !targetNode) return null;
              return <Connector key={edge.id} sourceNode={sourceNode} targetNode={targetNode} />;
          })}

          {nodes.map(node => (
            <Node
              key={node.id}
              node={node}
              onUpdate={updateNodeData}
              onAddNextNode={handleAddNextNode}
              onDrag={handleNodeDrag}
              onDelete={handleDeleteNode}
              onPreview={setPreviewImageUrl}
              onRegenerate={handleRegenerate}
              onOpenDocs={() => setIsDocsOpen(true)}
            />
          ))}
        </div>
      </div>
      
      {/* Design View */}
      <div className={`w-full h-full absolute inset-0 transition-all duration-300 ease-in-out ${mode === 'design' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <DesignCanvas />
      </div>

      {menuState && (
        <ActionMenu
          menuState={menuState}
          onSelect={handleAddNode}
          onClose={handleCloseMenu}
        />
      )}
      
      {isDocsOpen && <ImageScriptDocs onClose={() => setIsDocsOpen(false)} />}

      {previewImageUrl && (
        <div 
          className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-pop-in"
          onClick={() => setPreviewImageUrl(null)}
        >
          <img 
            src={previewImageUrl} 
            alt="Preview" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
           <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full text-white flex items-center justify-center transition-colors"
              aria-label="Close preview"
            >
              <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;