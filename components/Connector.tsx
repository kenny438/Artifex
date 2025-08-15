import React from 'react';
import type { NodeData } from '../types';

interface ConnectorProps {
  sourceNode: NodeData;
  targetNode: NodeData;
}

const Connector: React.FC<ConnectorProps> = ({ sourceNode, targetNode }) => {
  const sourceRef = React.useRef<HTMLDivElement>(null);
  const targetRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const sourceEl = document.getElementById(`node-wrapper-${sourceNode.id}`);
    const targetEl = document.getElementById(`node-wrapper-${targetNode.id}`);
    // @ts-ignore
    sourceRef.current = sourceEl;
    // @ts-ignore
    targetRef.current = targetEl;
  }, [sourceNode.id, targetNode.id]);

  if (!sourceNode || !targetNode) return null;
  
  // These positions are the top-left of the nodes.
  // We need to calculate the connection points.
  // Source: center-right edge. Target: center-left edge.
  const nodeWidth = 256; // w-64
  const nodeHeight = 256; // h-64
  
  const sourceX = sourceNode.position.x + nodeWidth;
  const sourceY = sourceNode.position.y + (nodeHeight / 2);
  
  const targetX = targetNode.position.x;
  const targetY = targetNode.position.y + (nodeHeight / 2);

  const pathData = `M ${sourceX} ${sourceY} C ${sourceX + 60} ${sourceY}, ${targetX - 60} ${targetY}, ${targetX} ${targetY}`;

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
       <defs>
        <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{stopColor: '#9ca3af', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#6b7280', stopOpacity: 1}} />
        </linearGradient>
      </defs>
      <path
        d={pathData}
        stroke="url(#edge-gradient)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx={targetX} cy={targetY} r="4" fill="#6b7280" />
    </svg>
  );
};

export default Connector;