// plotly.js 부분 번들의 타입은 @types/plotly.js를 그대로 쓴다 (D-010).
declare module 'plotly.js-cartesian-dist-min' {
  import Plotly from 'plotly.js';
  export default Plotly;
}
