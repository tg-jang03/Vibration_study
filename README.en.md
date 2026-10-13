<p align="center">
  <img src=".github/readme/banner.svg" alt="Vibration Study · 진동공부" width="100%">
</p>

<p align="center">
  <a href="README.md">한국어</a> · <b>English</b>
</p>

<h3 align="center">
  <a href="https://tg-jang03.github.io/Vibration_study/en/">Open the site</a> &nbsp;·&nbsp;
  <a href="https://tg-jang03.github.io/Vibration_study/en/lab/">Signal Lab</a> &nbsp;·&nbsp;
  <a href="https://tg-jang03.github.io/Vibration_study/en/reference/">Reference</a>
</h3>

<p align="center"><sub>All 11 Parts, 61 sections, 80 labs, figures and reference pages are available in English and Korean. Switch languages on any page.</sub></p>

<br>

A web textbook for learning **machine vibration analysis and rotor diagnostics** step by step. It runs from the physics of vibration and signal processing to condition diagnosis of large rotating machinery (gas and steam turbines, GT/ST), using figures, equations and hands-on labs along one continuous thread.

> Vibration-diagnosis books tend to fall into one of two camps: equations that never meet a real field plot, or severity tables with no word on **why the plot looks that way**.
> This textbook bridges the two. It starts from a question, builds only the concepts it needs, and lets you check each one with a slider.

<table>
  <tr>
    <td width="33%" valign="top">
      <h3>📐 Physics to diagnosis</h3>
      Mass–spring and modes → DSP → sensors → rotordynamics → field plots → faults → GT/ST. Eleven Parts on one thread.
    </td>
    <td width="33%" valign="top">
      <h3>🎛️ 80 interactive labs</h3>
      Every concept has a lab, with a walkthrough before it and an interpretation after it. Strobed disks, bearings and gears actually spin.
    </td>
    <td width="33%" valign="top">
      <h3>🧭 Starts from a question</h3>
      Each section opens with one question and builds the answer using only concepts from earlier sections, with a figure for every concept.
    </td>
  </tr>
</table>

## Learning path

<p align="center">
  <img src=".github/readme/roadmap-en.svg" alt="Learning path: four stages, eleven Parts" width="100%">
</p>

Eleven Parts in four stages, each answering one question. Click a Part to see its sections.

| Part | The question it answers |
|---|---|
| **① Foundations** — vibration · signals · sensors | |
| [1 · Vibration basics](https://tg-jang03.github.io/Vibration_study/en/parts/1/) | Why and how do machines shake? |
| [2 · Signal processing basics](https://tg-jang03.github.io/Vibration_study/en/parts/2/) | How does each analyzer setting change the spectrum? |
| [3 · Sensors and the measurement chain](https://tg-jang03.github.io/Vibration_study/en/parts/3/) | What did this number measure, and can we trust it? |
| **② Models & analysis** — rotors · advanced DSP | |
| [4 · Rotor dynamics basics](https://tg-jang03.github.io/Vibration_study/en/parts/4/) | What sets rotors apart, and when do they shake on their own? |
| [5 · Advanced signal processing](https://tg-jang03.github.io/Vibration_study/en/parts/5/) | How do we pull a buried fault signal out of the noise? |
| **③ Diagnosis** — plots · faults · GT/ST | |
| [6 · Reading field plots](https://tg-jang03.github.io/Vibration_study/en/parts/6/) | What does each plot show, and what does it hide? |
| [7 · Diagnosis by fault type](https://tg-jang03.github.io/Vibration_study/en/parts/7/) | Which fault mechanism does this pattern point to? |
| [8 · GT/ST-specific phenomena](https://tg-jang03.github.io/Vibration_study/en/parts/8/) | How do we read our machines during startup and operation? |
| **④ Action & practice** — testing · standards · cases | |
| [9 · Structural testing · balancing · alignment](https://tg-jang03.github.io/Vibration_study/en/parts/9/) | How do we confirm the cause, and how do we fix it? |
| [10 · Standards · assessment · diagnostic procedure](https://tg-jang03.github.io/Vibration_study/en/parts/10/) | How bad is it, and how do we judge and report it? |
| [11 · Integrated diagnostic practice](https://tg-jang03.github.io/Vibration_study/en/parts/11/) | Can you find the fault in data you have never seen? |

## How to read it

- **New to the subject? Start at Part 1 and go in order.** Each section uses only concepts from the sections before it, so if you get stuck, step back a section. Looking for one topic? Jump straight to it from the [learning map](https://tg-jang03.github.io/Vibration_study/en/).
- **Question → concepts and figures → lab → interpretation.** A section starts from one question, builds the concepts one at a time with figures, and lets you check them in a lab. The walkthrough before each lab tells you what to try; the interpretation after it tells you what you should have seen.
- **Look things up in the reference.** Find unfamiliar terms in the glossary and symbols and equations on the formula cards, then jump back to the section that first explained them.

## Signal Lab: labs you can play with

Build a virtual signal, change the settings, and use the formulas and readouts to see why the result comes out the way it does. Click a picture to open that lab.

<table>
  <tr>
    <td width="50%" valign="top">
      <a href="https://tg-jang03.github.io/Vibration_study/en/lab/frc-01/"><img src=".github/readme/lab-en-frc.png" alt="LAB-FRC-01 Forced vibration and resonance"></a>
      <b>LAB-FRC-01 · Forced vibration & resonance</b><br>
      <sub>The dashed box is where the same force would put the mass if applied slowly. With damping ratio 0.05 and forcing at the natural frequency, the steady-state amplitude is 10× larger and lags the force by a quarter-cycle.</sub>
    </td>
    <td width="50%" valign="top">
      <a href="https://tg-jang03.github.io/Vibration_study/en/lab/smp-01/"><img src=".github/readme/lab-en-smp.png" alt="LAB-SMP-01 Sampling and aliasing"></a>
      <b>LAB-SMP-01 · Sampling & aliasing</b><br>
      <sub>A strobe-lit spinning disk. Why does 940 Hz look like 60 Hz, and turn backwards?</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://tg-jang03.github.io/Vibration_study/en/lab/phs-01/"><img src=".github/readme/lab-en-phs.png" alt="LAB-PHS-01 Phase measurement"></a>
      <b>LAB-PHS-01 · Keyphasor & phase</b><br>
      <sub>The notch passes and gives a pulse; the high spot arrives and gives a peak. The time difference Δt gives the phase relative to the once-per-revolution pulse.</sub>
    </td>
    <td width="50%" valign="top">
      <a href="https://tg-jang03.github.io/Vibration_study/en/lab/brg-02/"><img src=".github/readme/lab-en-brg.png" alt="LAB-BRG-02 Rolling-bearing faults"></a>
      <b>LAB-BRG-02 · Rolling-bearing faults</b><br>
      <sub>An impact every time a ball strikes the defect. Compare the even impacts of an outer-race defect with the 1X modulation of an inner-race defect.</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://tg-jang03.github.io/Vibration_study/en/lab/gear-01/"><img src=".github/readme/lab-en-gear.png" alt="LAB-GEAR-01 Gear faults"></a>
      <b>LAB-GEAR-01 · Gear faults</b><br>
      <sub>A 23/61-tooth pair in mesh. Switch from healthy to a broken tooth to add one big impact per turn.</sub>
    </td>
    <td width="50%" valign="top">
      <a href="https://tg-jang03.github.io/Vibration_study/en/lab/fou-01/"><img src=".github/readme/lab-en-fou.png" alt="LAB-FOU-01 Building harmonics"></a>
      <b>LAB-FOU-01 · Building harmonics</b><br>
      <sub>Start with a sine wave and add harmonics. The height of the rotating-arrow chain approaches a square wave.</sub>
    </td>
  </tr>
</table>

<p align="center"><a href="https://tg-jang03.github.io/Vibration_study/en/lab/"><b>See all 80 labs →</b></a></p>

## Reference: connect the concepts

The [reference hub](https://tg-jang03.github.io/Vibration_study/en/reference/) brings together a concept overview, [95 sources](https://tg-jang03.github.io/Vibration_study/en/reference/sources/), a [520-entry glossary](https://tg-jang03.github.io/Vibration_study/en/reference/glossary/) and [41 symbol and formula cards](https://tg-jang03.github.io/Vibration_study/en/reference/formulas/). Entries link back to the relevant course sections. The same reference pages are available in Korean.

<br>

<p align="center"><sub>A personal study site, published openly · If you spot an error, an issue report is very welcome</sub></p>
