export const getFullDomainName = (domainCode) => {
  const domainMap = {
    'DBMS': 'Database Management Systems',
    'DSA': 'Data Structures & Algorithms',
    'OS': 'Operating Systems',
    'COA': 'Computer Organization & Architecture',
    'SE': 'Software Engineering',
    'TOC': 'Theory of Computation',
    'AI': 'Artificial Intelligence',
    'Networks': 'Computer Networks',
    'Cyber': 'Cybersecurity',
    'Cloud': 'Cloud Computing'
  };
  
  return domainMap[domainCode] || domainCode;
};
