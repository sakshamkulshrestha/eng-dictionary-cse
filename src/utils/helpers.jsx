import React from 'react';
import { Book, Cpu, Server, Globe, Brain, Database, Hash, Code, Terminal } from 'lucide-react';

export const getDomainIcon = (domain) => {
  switch (domain) {
    case 'Algorithms': return <Hash className="w-6 h-6 text-blue-500" />;
    case 'Operating Systems': return <Server className="w-6 h-6 text-green-500" />;
    case 'Computer Networks': return <Globe className="w-6 h-6 text-purple-500" />;
    case 'Computer Architecture': return <Cpu className="w-6 h-6 text-orange-500" />;
    case 'Artificial Intelligence': return <Brain className="w-6 h-6 text-pink-500" />;
    case 'Database Systems': return <Database className="w-6 h-6 text-teal-500" />;
    default: return <Book className="w-6 h-6 text-gray-500" />;
  }
};