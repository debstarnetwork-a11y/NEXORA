import { runAllIntegrityTests } from './src/lib/__tests__/researchIntegrityTests';

console.log('================================================================');
console.log('RUNNING AUTOMATED ACADEMIC RESEARCH INTEGRITY TEST SUITE (A - J)');
console.log('================================================================\n');

const suite = runAllIntegrityTests();

suite.results.forEach((res, idx) => {
  const statusIcon = res.passed ? '✓ PASS' : '✗ FAIL';
  console.log(`[${statusIcon}] Test ${String.fromCharCode(65 + idx)}: ${res.suite}`);
  console.log(`       Objective: ${res.name}`);
  console.log(`       Outcome:   ${res.message}`);
  if (res.evidence) {
    console.log(`       Evidence:  ${JSON.stringify(res.evidence)}`);
  }
  console.log('');
});

console.log('----------------------------------------------------------------');
console.log(`SUMMARY: ${suite.passedCount} / ${suite.totalCount} TEST SUITES PASSED`);
console.log(`ALL TESTS PASSED: ${suite.allPassed ? 'YES' : 'NO'}`);
console.log('================================================================');

if (!suite.allPassed) {
  process.exit(1);
}
