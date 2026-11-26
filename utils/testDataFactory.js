/**
 * Dynamic, collision-free HRIS test data factory & cleanup registry.
 * Enforces AutoQA_<timestamp>_<random> prefixing and OrangeHRM field length limits.
 */

function uniqueToken() {
  const ts = String(Date.now()).slice(-5);
  const rand = Math.floor(100 + Math.random() * 900);
  return `${ts}_${rand}`;
}

function createEmployee(overrides = {}) {
  const token = uniqueToken();
  const compact = token.replace('_', '');
  const firstName = overrides.firstName || `AutoQA_${token}`;
  const middleName = overrides.middleName ?? 'HR';
  const lastName = overrides.lastName || `Emp${compact.slice(-4)}`;
  const employeeId = overrides.employeeId || `AQ${compact.slice(-6)}`;
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');

  return {
    firstName,
    middleName,
    lastName,
    employeeId,
    fullName,
    otherId: `OID-${compact.slice(-4)}`,
    ...overrides,
  };
}

function createSystemUser(employee, overrides = {}) {
  const token = uniqueToken();
  const username = overrides.username || `AutoQA_${token}`;
  const password = overrides.password || 'AutoQa@2026!';
  return {
    role: overrides.role || 'ESS',
    status: overrides.status || 'Enabled',
    employeeName: employee ? employee.fullName : '',
    employeeSearchTerm: employee ? employee.firstName : '',
    username,
    password,
    ...overrides,
  };
}

function createCandidate(overrides = {}) {
  const token = uniqueToken();
  const compact = token.replace('_', '');
  const firstName = overrides.firstName || `AutoQA_${token}`;
  const middleName = overrides.middleName ?? 'QA';
  const lastName = overrides.lastName || `Cand${compact.slice(-4)}`;
  const email = overrides.email || `autoqa.${compact}@example.com`;
  const contactNumber = overrides.contactNumber || `55501${compact.slice(-5)}`;

  return {
    firstName,
    middleName,
    lastName,
    fullName: [firstName, middleName, lastName].filter(Boolean).join(' '),
    email,
    contactNumber,
    keywords: 'Playwright, QA, Automation',
    notes: `Automated recruitment intake ${token}`,
    resumeFile: {
      name: `AutoQA_Resume_${compact}.txt`,
      mimeType: 'text/plain',
      buffer: Buffer.from(
        `Candidate: ${firstName} ${lastName}\nEmail: ${email}\nSkills: Playwright, BDD, Enterprise HRIS QA\n`,
        'utf-8'
      ),
    },
    ...overrides,
  };
}

class CleanupRegistry {
  constructor() {
    this.systemUsers = [];
    this.candidates = [];
    this.employees = [];
  }

  trackSystemUser(username) {
    if (username && username.startsWith('AutoQA_') && !this.systemUsers.includes(username)) {
      this.systemUsers.push(username);
    }
  }

  untrackSystemUser(username) {
    this.systemUsers = this.systemUsers.filter((u) => u !== username);
  }

  trackCandidate(candidate) {
    if (candidate && candidate.firstName && candidate.firstName.startsWith('AutoQA_')) {
      const exists = this.candidates.some((c) => c.firstName === candidate.firstName);
      if (!exists) this.candidates.push(candidate);
    }
  }

  untrackCandidate(firstName) {
    this.candidates = this.candidates.filter((c) => c.firstName !== firstName);
  }

  trackEmployee(employee) {
    if (employee && employee.employeeId && employee.firstName.startsWith('AutoQA_')) {
      const exists = this.employees.some((e) => e.employeeId === employee.employeeId);
      if (!exists) this.employees.push(employee);
    }
  }

  untrackEmployee(employeeId) {
    this.employees = this.employees.filter((e) => e.employeeId !== employeeId);
  }
}

module.exports = {
  uniqueToken,
  createEmployee,
  createSystemUser,
  createCandidate,
  CleanupRegistry,
};
