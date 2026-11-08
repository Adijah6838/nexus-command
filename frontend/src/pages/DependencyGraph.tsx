import { useCallback } from 'react';
import ReactFlow, { Background, Controls, useNodesState, useEdgesState, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  { id: 'api', position: { x: 250, y: 0 }, data: { label: 'API Gateway' }, style: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px' } },
  { id: 'auth', position: { x: 100, y: 100 }, data: { label: 'Auth Service' }, style: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' } },
  { id: 'payment', position: { x: 400, y: 100 }, data: { label: 'Payment' }, style: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' } },
  { id: 'db', position: { x: 250, y: 200 }, data: { label: 'PostgreSQL' }, style: { background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px' } },
];

const initialEdges = [
  { id: 'e1-2', source: 'api', target: 'auth', animated: true },
  { id: 'e1-3', source: 'api', target: 'payment', animated: true },
  { id: 'e2-4', source: 'auth', target: 'db', animated: true },
  { id: 'e3-4', source: 'payment', target: 'db', animated: true },
];

export function DependencyGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div style={{ height: 'calc(100vh - 120px)', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
