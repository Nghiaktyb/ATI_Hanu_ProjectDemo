export type DepartmentRoleGroup = {
  department: string;
  roles: string[];
};

export const DEPARTMENT_ROLE_GROUPS: DepartmentRoleGroup[] = [
  {
    department: "Executive & Leadership",
    roles: [
      "CEO (Chief Executive Officer)",
      "COO (Chief Operating Officer)",
      "CFO (Chief Financial Officer)",
      "CTO (Chief Technology Officer)",
      "CHRO (Chief Human Resources Officer)",
      "CMO (Chief Marketing Officer)",
      "CIO (Chief Information Officer)",
    ],
  },
  {
    department: "Administrative & Office Operations",
    roles: [
      "Office Manager",
      "Executive Assistant / Administrative Assistant",
      "Receptionist",
      "Facilities Manager",
      "Procurement Specialist",
    ],
  },
  {
    department: "Human Resources Department",
    roles: [
      "HR Manager / HR Director",
      "Recruiter / Talent Acquisition Specialist",
      "Training & Development Officer",
      "Compensation & Benefits Specialist",
      "Employee Relations Officer",
      "HR Coordinator / HR Assistant",
    ],
  },
  {
    department: "Finance & Accounting",
    roles: [
      "Accountant",
      "Financial Analyst",
      "Accounts Payable Specialist",
      "Accounts Receivable Specialist",
      "Payroll Officer",
      "Internal Auditor",
      "Controller",
    ],
  },
  {
    department: "IT & Technical Department",
    roles: [
      "IT Manager",
      "System Administrator",
      "Network Engineer",
      "Helpdesk / IT Support",
      "Cybersecurity Specialist",
      "Software Developer / Engineer",
      "Database Administrator",
      "DevOps Engineer",
      "QA Engineer",
    ],
  },
  {
    department: "Sales Department",
    roles: [
      "Sales Director / Sales Manager",
      "Account Executive",
      "Account Manager",
      "Business Development Specialist",
      "Sales Representative",
      "Customer Success Manager",
      "Sales Operations Analyst",
    ],
  },
  {
    department: "Marketing Department",
    roles: [
      "Marketing Manager",
      "Digital Marketing Specialist",
      "SEO/SEM Specialist",
      "Content Creator / Copywriter",
      "Graphic Designer",
      "Social Media Manager",
      "Brand Manager",
      "Market Research Analyst",
    ],
  },
  {
    department: "Operations & Supply Chain",
    roles: [
      "Operations Manager",
      "Supply Chain Manager",
      "Logistics Coordinator",
      "Warehouse Supervisor",
      "Inventory Control Specialist",
      "Production Planner",
    ],
  },
  {
    department: "Product & Project Management",
    roles: [
      "Product Manager",
      "Product Owner",
      "Project Manager",
      "Scrum Master",
      "Business Analyst",
      "UI/UX Designer",
    ],
  },
  {
    department: "Customer Service",
    roles: [
      "Customer Service Manager",
      "Call Center Agent",
      "Technical Support Specialist",
      "Client Relations Officer",
    ],
  },
  {
    department: "Legal & Compliance",
    roles: [
      "Legal Counsel",
      "Compliance Officer",
      "Contract Specialist",
      "Risk Management Officer",
    ],
  },
  {
    department: "R&D (Research & Development)",
    roles: [
      "R&D Manager",
      "Research Scientist",
      "Product Development Engineer",
      "Quality Control Specialist",
    ],
  },
  {
    department: "Manufacturing / Factory (If Applicable)",
    roles: [
      "Plant Manager",
      "Production Supervisor",
      "Machine Operator",
      "Quality Assurance Inspector",
      "Safety Officer",
    ],
  },
  {
    department: "Security",
    roles: [
      "Security Manager",
      "Security Guard",
      "CCTV Monitoring Officer",
    ],
  },
  {
    department: "Other Optional Departments",
    roles: [
      "Public Relations",
      "Investor Relations",
      "Data Analytics Team",
      "Training Center",
      "Event Management Team",
    ],
  },
];

export const DEPARTMENT_NAMES = DEPARTMENT_ROLE_GROUPS.map((group) => group.department);

