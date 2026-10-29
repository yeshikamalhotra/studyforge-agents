export interface SampleNotePreset {
  id: string;
  title: string;
  course: string;
  icon: string;
  badge: string;
  description: string;
  content: string;
}

export const SAMPLE_NOTES: SampleNotePreset[] = [
  {
    id: 'ml_neural_nets',
    title: 'Neural Networks & Backpropagation',
    course: 'CS 229: Machine Learning',
    icon: 'Network',
    badge: 'STEM / AI',
    description: 'Gradient descent, cross-entropy loss, chain rule calculus, and numerical weight updates.',
    content: `# CS 229: Lecture 7 - Deep Neural Networks & Backpropagation

## 1. Overview & Objective
Artificial Neural Networks (ANNs) map input vectors x in R^d to output predictions y_hat through layers of affine transformations interleaved with non-linear activation functions. Optimization is conducted via Empirical Risk Minimization using gradient descent algorithms.

## 2. Forward Propagation
Given layer l with weights W^(l) and bias b^(l):
- Linear activation: z^(l) = W^(l) * a^(l-1) + b^(l)
- Post-activation: a^(l) = sigma(z^(l))

Common activation functions:
- Rectified Linear Unit (ReLU): f(z) = max(0, z). Derivative is 1 if z > 0, else 0. Solves saturation problems.
- Sigmoid: sigma(z) = 1 / (1 + e^(-z)). Derivative is sigma(z) * (1 - sigma(z)). Susceptible to vanishing gradients for |z| >> 0.

## 3. Loss Function & Empirical Risk
For binary classification with labels y in {0, 1}:
Binary Cross-Entropy Loss:
L(y, y_hat) = - [ y * ln(y_hat) + (1 - y) * ln(1 - y_hat) ]

Mean Squared Error (Regression):
MSE = (1 / 2m) * sum_{i=1}^m (y^(i) - y_hat^(i))^2

## 4. Backpropagation & The Chain Rule
To calculate the partial derivative of loss L with respect to parameter weight w_ij:
delta^(l) = (partial L / partial z^(l))
For output layer L: delta^(L) = (a^(L) - y) (when pairing softmax with cross-entropy).
For hidden layer l: delta^(l) = ((W^(l+1))^T * delta^(l+1)) elementwise_prod sigma'(z^(l)).
Gradient for weights: partial L / partial W^(l) = delta^(l) * (a^(l-1))^T.

## 5. Parameter Update Rule (Gradient Descent)
Given learning rate eta > 0:
w_new = w_old - eta * (partial L / partial w_old)

Example Calculation:
If current weight w_old = 0.85, learning rate eta = 0.05, and computed loss gradient (partial L / partial w) = 2.40:
w_new = 0.85 - (0.05 * 2.40) = 0.85 - 0.12 = 0.73.

## 6. Optimization Pitfalls & Regularization
- Vanishing Gradient Problem: Occurs in deep networks when sigmoid/tanh activations cause gradients to multiply to zero.
- Exploding Gradients: Addressed via gradient clipping (if ||g|| > threshold, g = threshold * g / ||g||).
- L2 Regularization (Weight Decay): Adds (lambda / 2) * ||W||_2^2 to objective function.`
  },
  {
    id: 'phys_carnot',
    title: 'Thermodynamics & Carnot Engines',
    course: 'PHYS 210: Thermal Physics',
    icon: 'Flame',
    badge: 'Physics / Engineering',
    description: 'Carnot cycle efficiency, heat exchange, entropy changes, and maximum theoretical work.',
    content: `# PHYS 210: Thermodynamics of Heat Engines & The Carnot Cycle

## 1. Fundamental Principles
A thermodynamic heat engine operates cyclically between a high-temperature heat reservoir at absolute temperature T_H (Kelvin) and a low-temperature cold reservoir at T_C (Kelvin).
First Law of Thermodynamics:
Delta U = Q - W
For a complete thermodynamic cycle, Delta U_cycle = 0, which implies:
W_net = Q_H - Q_C

## 2. Thermal Efficiency
The thermal efficiency eta of any heat engine is defined as useful mechanical work output divided by heat input:
eta = W_net / Q_H = (Q_H - Q_C) / Q_H = 1 - (Q_C / Q_H)

## 3. The Carnot Engine & Carnot Efficiency Theorem
According to Carnot's theorem, no engine operating between two given heat reservoirs can be more efficient than a reversible Carnot engine operating between the same reservoirs.
For a reversible Carnot cycle:
(Q_C / Q_H) = (T_C / T_H)

Maximum Theoretical Efficiency (Carnot Efficiency):
eta_Carnot = 1 - (T_C / T_H) = (T_H - T_C) / T_H
Where temperatures T_H and T_C MUST be expressed in absolute temperature (Kelvin, K = degC + 273.15).

Sample Calculation:
A steam turbine takes heat from boiler steam at 327 degC (T_H = 327 + 273.15 = 600 K) and exhausts into cooling river water at 27 degC (T_C = 27 + 273.15 = 300 K).
eta_Carnot = 1 - (300 / 600) = 1 - 0.50 = 0.50 (50.0% maximum efficiency).
If the engine absorbs 40,000 Joules of heat from the boiler (Q_H = 40,000 J), maximum work output is:
W_max = eta * Q_H = 0.50 * 40,000 J = 20,000 Joules.
Remaining 20,000 J is rejected to the cold reservoir as waste heat Q_C.

## 4. Four Stages of the Carnot Cycle (PV Diagram)
1. Reversible Isothermal Expansion (at T_H): Absorbs heat Q_H from hot reservoir while gas does work.
2. Reversible Adiabatic Expansion (T_H -> T_C): Q = 0; gas expands further, cooling down to T_C.
3. Reversible Isothermal Compression (at T_C): Compresses gas at constant T_C, rejecting heat Q_C.
4. Reversible Adiabatic Compression (T_C -> T_H): Q = 0; work done on gas heats it back to T_H.

## 5. Entropy & Second Law of Thermodynamics
Entropy change for a reversible isothermal heat transfer:
Delta S = Q / T
For a complete reversible Carnot cycle:
Delta S_universe = Delta S_system + Delta S_surroundings = 0.
For any real, irreversible cycle: Delta S_universe > 0 (Clausius inequality).`
  },
  {
    id: 'bio_cellular_resp',
    title: 'Cellular Respiration & ATP Yield',
    course: 'BIO 150: Molecular & Cellular Biology',
    icon: 'Dna',
    badge: 'Life Sciences',
    description: 'Glycolysis, Krebs cycle, chemiosmosis, proton gradients, and net ATP stoichiometry.',
    content: `# BIO 150: Principles of Cellular Respiration & Bioenergetics

## 1. Overview & Metabolic Equation
Aerobic cellular respiration catabolizes glucose to synthesize adenosine triphosphate (ATP), the chemical energy currency of biological cells.
Overall balanced reaction:
C6H12O6 + 6 O2 + 30-32 ADP + 30-32 Pi -> 6 CO2 + 6 H2O + 30-32 ATP + Heat

Standard free energy change:
Delta G_deg' = -2,870 kJ/mol (strongly exergonic reaction).

## 2. Stage 1: Glycolysis (Cytosol)
- Anaerobic process breaking 1 Glucose (6C) into 2 Pyruvate (3C).
- Energy Investment Phase: Consumes 2 ATP (Hexokinase and PFK-1 enzymes).
- Energy Payoff Phase: Generates 4 ATP via substrate-level phosphorylation + 2 NADH + 2 H+.
- Net Yield per glucose: 2 Net ATP + 2 NADH.

## 3. Stage 2: Pyruvate Oxidation & The Citric Acid (Krebs) Cycle (Mitochondrial Matrix)
- Pyruvate Dehydrogenase Complex converts 2 Pyruvate into 2 Acetyl-CoA + 2 CO2 + 2 NADH.
- Citric Acid Cycle (2 turns per original glucose molecule):
  - Acetyl-CoA (2C) condenses with Oxaloacetate (4C) to form Citrate (6C).
  - Yield per turn: 3 NADH, 1 FADH2, 1 ATP (or GTP), 2 CO2.
  - Total per glucose: 6 NADH + 2 FADH2 + 2 ATP + 4 CO2.

## 4. Stage 3: Oxidative Phosphorylation & Electron Transport Chain (ETC)
- Located in inner mitochondrial membrane (cristae).
- High-energy electrons donated from NADH (at Complex I) and FADH2 (at Complex II) flow down redox potential gradient through Coenzyme Q, Complex III, Cytochrome c, and Complex IV to terminal electron acceptor O2 (forming H2O).
- Complexes I, III, and IV pump protons (H+) from mitochondrial matrix into the intermembrane space.
- Creates Proton-Motive Force (PMF): electrical gradient (Delta psi ~ 160-180 mV) + pH gradient (Delta pH ~ 0.5-1.0 units).
Delta p = Delta psi - (2.3 * R * T / F) * Delta pH.

## 5. Chemiosmosis & ATP Synthase Stoichiometry
- Protons flow back down electrochemical gradient into the matrix through the F0 rotor subunit of ATP Synthase, rotating the catalytic F1 head to synthesize ATP from ADP and Pi.
- Approximately 4 H+ ions are required to synthesize and export 1 ATP molecule.
- P/O Ratios:
  - 1 NADH yields ~2.5 ATP (pumps ~10 H+).
  - 1 FADH2 yields ~1.5 ATP (pumps ~6 H+).
- Theoretical Net Calculation per glucose:
  - Glycolysis: 2 ATP + 2 NADH (3-5 ATP)
  - Pyruvate Dehydrogenase: 2 NADH (~5 ATP)
  - Citric Acid Cycle: 2 ATP + 6 NADH (~15 ATP) + 2 FADH2 (~3 ATP)
  - Total: 30 to 32 ATP molecules.`
  }
];
