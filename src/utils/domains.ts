export const getFullDomainName = (domain: string): string => {
  const domains: Record<string, string> = {
    'ai': 'Artificial Intelligence',
    'cloud': 'Cloud Computing',
    'coa': 'Computer Organization & Architecture',
    'cyber': 'Cybersecurity',
    'dbms': 'Database Management Systems',
    'dsa': 'Data Structures & Algorithms',
    'networks': 'Computer Networks',
    'os': 'Operating Systems',
    'se': 'Software Engineering',
    'toc': 'Theory of Computation'
  };
  return domains[domain.toLowerCase()] || domain;
};
