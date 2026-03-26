import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { getAllConcepts } from '../utils/searchEngine';
import { Concept } from '../types';
import { useNavigate } from 'react-router-dom';
import { Network, Info } from 'lucide-react';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  term: string;
  domain: string;
  difficulty: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
}

export default function GraphView() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const concepts = getAllConcepts();

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 600;

    const nodes: Node[] = concepts.map(c => ({
      id: c.id,
      term: c.term,
      domain: c.domain,
      difficulty: c.difficulty
    }));

    const links: Link[] = [];
    concepts.forEach(c => {
      c.prerequisites.forEach(prereq => {
        const target = concepts.find(concept => concept.term.toLowerCase() === prereq.toLowerCase());
        if (target) {
          links.push({
            source: target.id,
            target: c.id
          });
        }
      });
    });

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    // Arrow marker
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#94a3b8')
      .style('stroke', 'none');

    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .on('click', (event, d) => navigate(`/concept/${d.id}`))
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    node.append('circle')
      .attr('r', 24)
      .attr('fill', d => {
        if (d.difficulty === 'Beginner') return '#ecfdf5';
        if (d.difficulty === 'Intermediate') return '#fffbeb';
        return '#fff1f2';
      })
      .attr('stroke', d => {
        if (d.difficulty === 'Beginner') return '#10b981';
        if (d.difficulty === 'Intermediate') return '#f59e0b';
        return '#f43f5e';
      })
      .attr('stroke-width', 2);

    node.append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1e293b')
      .text(d => d.term);

    node.append('title')
      .text(d => `${d.term} (${d.domain})`);

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [concepts, navigate]);

  return (
    <div className="space-y-12 pb-20">
      <section className="text-center space-y-6 pt-12">
        <h1 className="text-page-title text-[var(--text)]">
          Relationship <span className="text-[#0071E3]">Graph</span>
        </h1>
        <p className="text-xl text-muted max-w-2xl mx-auto font-medium">
          Visualize how engineering concepts are interconnected through prerequisites and domains.
        </p>
      </section>

      <div className="bg-card rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden relative">
        <div className="absolute top-8 left-8 z-10 flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100">
          <Network className="w-4 h-4" />
          <span>Interactive Knowledge Map</span>
        </div>

        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted">
            <div className="w-3 h-3 bg-emerald-50 border border-emerald-500 rounded-full" />
            <span>Beginner</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted">
            <div className="w-3 h-3 bg-amber-50 border border-amber-500 rounded-full" />
            <span>Intermediate</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted">
            <div className="w-3 h-3 bg-rose-50 border border-rose-500 rounded-full" />
            <span>Advanced</span>
          </div>
        </div>

        <div ref={containerRef} className="w-full h-[600px] cursor-grab active:cursor-grabbing">
          <svg ref={svgRef} className="w-full h-full" />
        </div>

        <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between bg-card text-white p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[var(--active)] rounded-xl flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold">Navigation Tip</p>
              <p className="text-xs text-white/60">Drag to pan, scroll to zoom, click nodes to view details.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-card text-[var(--text)] text-sm font-bold rounded-xl hover:bg-search transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
}
