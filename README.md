# 진동공부 (Vibration Study)

기초 진동 역학(MCK·모드해석)에서 대형 회전기계(GT/ST) 진동 진단까지 공부하는 개인 학습 사이트입니다.
신호처리는 가상 신호를 직접 조작하는 인터랙티브 랩과 수식으로 익힙니다.

- 사이트: https://tg-jang03.github.io/Vibration_study/ (`main`에 push하면 GitHub Actions가 검사 후 자동 배포)
- 작업 규칙과 문서 목록: [AGENTS.md](AGENTS.md)
- 커리큘럼: [docs/Curriculum.md](docs/Curriculum.md) · 로드맵: [docs/Roadmap.md](docs/Roadmap.md) · 진행 상황: [docs/Progress.md](docs/Progress.md)

## 개발

Node.js 22.12 이상이 필요합니다 (Astro 7 요구사항, 개발 환경은 v24.19.0).

```sh
npm install
npm run dev      # http://localhost:4321/Vibration_study/
npm run check    # 타입 검사
npm test         # 단위 테스트 (Vitest)
npm run build    # dist/ 에 정적 빌드
```
