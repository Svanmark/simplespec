# Quality Rubric

Use this rubric to evaluate each framework output after implementation.

## Scoring

Give each category a score from **1 (poor)** to **5 (excellent)**.

### 1. Correctness
- Implements every requirement in `FEATURE_REQUEST.md`
- Handles validation and edge cases correctly
- Produces expected outputs

### 2. Test quality
- Adds meaningful tests for happy path and edge cases
- Tests are deterministic and easy to understand
- Existing tests remain green

### 3. Code quality
- Clear names and structure
- Good readability and maintainability
- Avoids unnecessary complexity

### 4. Robustness
- Graceful error handling
- No hidden assumptions or brittle logic
- Stable behavior under invalid input

## Optional weighted score

If you want a single final score:

```text
Final Score = (Correctness * 0.4) + (Test quality * 0.2) + (Code quality * 0.2) + (Robustness * 0.2)
```

## Notes template

- Strengths:
- Weaknesses:
- Any manual fixes needed after generation:
