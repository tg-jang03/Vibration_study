/** 양측 복소 DFT. bin 순서: DC → 양의 주파수 → 나이퀴스트 → 음의 주파수. */
export interface ComplexSpectrum {
  real: Float64Array;
  imag: Float64Array;
}

function assertFftSize(size: number): void {
  const exponent = Math.log2(size);
  if (!Number.isSafeInteger(size) || size < 1 || !Number.isInteger(exponent) || 2 ** exponent !== size) {
    throw new RangeError('FFT 크기는 1 이상의 2의 거듭제곱이어야 한다');
  }
}

/** 원래 값 뒤에 0을 채운 새 배열. 입력을 자르거나 변경하지 않는다. */
export function zeroPad(values: ArrayLike<number>, fftSize: number): Float64Array {
  assertFftSize(fftSize);
  if (values.length < 1 || fftSize < values.length) {
    throw new RangeError('입력은 비어 있지 않아야 하며 FFT 크기는 입력 길이 이상이어야 한다');
  }
  const padded = new Float64Array(fftSize);
  for (let i = 0; i < values.length; i++) {
    if (!Number.isFinite(values[i])) throw new RangeError('샘플은 유한한 수여야 한다');
    padded[i] = values[i];
  }
  return padded;
}

/**
 * radix-2 전방 FFT: X[k] = Σ x[n] exp(−j 2πkn/N), 정규화 없음 (Contents §3, R-12).
 * 허수부 생략 시 실신호. 두 입력의 길이는 같은 2의 거듭제곱이어야 한다.
 * 계산은 복사본에서 수행하므로 입력을 보존한다. 시간 O(N log N), 공간 O(N).
 */
export function fft(realInput: ArrayLike<number>, imagInput?: ArrayLike<number>): ComplexSpectrum {
  const n = realInput.length;
  assertFftSize(n);
  if (imagInput && imagInput.length !== n) {
    throw new RangeError('실수부와 허수부 길이가 같아야 한다');
  }
  const real = new Float64Array(n);
  const imag = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const re = realInput[i];
    const im = imagInput ? imagInput[i] : 0;
    if (!Number.isFinite(re) || !Number.isFinite(im)) {
      throw new RangeError('샘플은 유한한 수여야 한다');
    }
    real[i] = re;
    imag[i] = im;
  }

  // 비트 반전 순서로 배치한다. 32-bit 비트 연산의 길이 제한을 피한다.
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n / 2;
    while (j >= bit) {
      j -= bit;
      bit /= 2;
    }
    j += bit;
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
  }

  // 각 단계에서 필요한 회전인자(twiddle factor)를 한 번씩 계산해 블록에 재사용한다.
  for (let size = 2; size <= n; size *= 2) {
    const half = size / 2;
    for (let offset = 0; offset < half; offset++) {
      const angle = -2 * Math.PI * offset / size;
      const wr = Math.cos(angle);
      const wi = Math.sin(angle);
      for (let even = offset; even < n; even += size) {
        const odd = even + half;
        const tr = wr * real[odd] - wi * imag[odd];
        const ti = wr * imag[odd] + wi * real[odd];
        real[odd] = real[even] - tr;
        imag[odd] = imag[even] - ti;
        real[even] += tr;
        imag[even] += ti;
      }
    }
  }
  return { real, imag };
}
