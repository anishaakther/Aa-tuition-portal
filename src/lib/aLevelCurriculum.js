const chapter=(number,name,topics)=>({number,name,topics:topics.map((name,i)=>({number:`${number}.${i+1}`,name}))})
const module=(key,name,chapters)=>({key,name,chapters})

export const A_LEVEL_MATHS_MODULES=[
module('pure1','Pure 1',[
chapter(1,'Algebraic expressions',['Index laws','Expanding brackets','Factorising','Negative and fractional indices','Surds','Rationalising denominators']),
chapter(2,'Quadratics',['Solving quadratic equations','Completing the square','Functions','Quadratic graphs','The discriminant','Modelling with quadratics']),
chapter(3,'Equations and inequalities',['Linear simultaneous equations','Quadratic simultaneous equations','Simultaneous equations on graphs','Linear inequalities','Quadratic inequalities','Inequalities on graphs','Regions']),
chapter(4,'Graphs and transformations',['Cubic graphs','Quartic graphs','Reciprocal graphs','Points of intersection','Translating graphs','Stretching graphs','Transforming functions']),
chapter(5,'Straight line graphs',['y = mx + c','Equations of straight lines','Parallel and perpendicular lines','Length and area','Modelling with straight lines']),
chapter(6,'Circles',['Midpoints and perpendicular bisectors','Equation of a circle','Intersections of straight lines and circles','Use tangent and chord properties','Circles and triangles']),
chapter(7,'Algebraic methods',['Algebraic fractions','Dividing polynomials','The factor theorem','Mathematical proof','Methods of proof']),
chapter(8,'The binomial expansion',["Pascal's triangle",'Factorial notation','The binomial expansion','Solving binomial problems','Binomial estimation']),
chapter(9,'Trigonometric ratios',['The cosine rule','The sine rule','Areas of triangles','Solving triangle problems','Graphs of sine, cosine and tangent','Transforming trigonometric graphs']),
chapter(10,'Trigonometric identities and equations',['Angles in all four quadrants','Exact values of trigonometric ratios','Trigonometric identities','Simple trigonometric equations','Harder trigonometric equations','Equations and identities']),
chapter(11,'Vectors',['Vectors','Representing vectors','Magnitude and direction','Position vectors','Solving geometric problems','Modelling with vectors']),
chapter(12,'Differentiation',['Gradients of curves','Finding the derivative','Differentiating xⁿ','Differentiating quadratics','Differentiating functions with two or more terms','Gradients, tangents and normals','Increasing and decreasing functions','Second order derivatives','Stationary points','Sketching gradient functions','Modelling with differentiation']),
chapter(13,'Integration',['Integrating xⁿ','Indefinite integrals','Finding functions','Definite integrals','Areas under curves','Areas under the x-axis','Areas between curves and lines']),
chapter(14,'Exponentials and logarithms',['Exponential functions','y = eˣ','Exponential modelling','Logarithms','Laws of logarithms','Solving equations using logarithms','Working with natural logarithms','Logarithms and non-linear data'])
]),
module('pure2','Pure 2',[
chapter(1,'Algebraic methods',['Proof by contradiction','Algebraic fractions','Partial fractions','Repeated factors','Algebraic division']),
chapter(2,'Functions and graphs',['The modulus function','Functions and mappings','Composite functions','Inverse functions','y = |f(x)| and y = f(|x|)','Combining transformations','Solving modulus problems']),
chapter(3,'Sequences and series',['Arithmetic sequences','Arithmetic series','Geometric sequences','Geometric series','Sum to infinity','Sigma notation','Recurrence relations','Modelling with series']),
chapter(4,'Binomial expansion',['Expanding (1 + x)ⁿ','Expanding (a + bx)ⁿ','Using partial fractions']),
chapter(5,'Radians',['Radian measure','Arc length','Areas of sectors and segments','Solving trigonometry problems','Small angle approximations']),
chapter(6,'Trigonometric functions',['Secant, cosecant and cotangent','Graphs of sec x, cosec x and cot x','Using sec x, cosec x and cot x','Trigonometric identities','Inverse trigonometric functions']),
chapter(7,'Trigonometry and modelling',['Addition formulae','Using the angle addition formulae','Double-angle formulae','Solving trigonometric equations','Simplifying a cos x ± b sin x','Proving trigonometric identities','Modelling with trigonometric functions']),
chapter(8,'Parametric equations',['Parametric equations','Using trigonometric identities','Curve sketching','Points of intersection','Modelling with parametric equations']),
chapter(9,'Differentiation',['Differentiating sin x and cos x','Differentiating exponentials and logarithms','The chain rule','The product rule','The quotient rule','Differentiating trigonometric functions','Parametric differentiation','Implicit differentiation','Using second derivatives','Rates of change']),
chapter(10,'Numerical methods',['Locating roots','Iteration','The Newton–Raphson method','Applications to modelling']),
chapter(11,'Integration',['Integrating standard functions','Integrating f(ax + b)','Using trigonometric identities','Reverse chain rule','Integration by substitution','Integration by parts','Partial fractions','Finding areas','The trapezium rule','Solving differential equations','Modelling with differential equations','Integration as the limit of a sum']),
chapter(12,'Vectors',['3D coordinates','Vectors in 3D','Solving geometric problems','Application to mechanics'])
]),
module('stats_mech_y1','Statistics & Mechanics Year 1',[
chapter(1,'Data collection',['Populations and samples','Sampling','Non-random sampling','Types of data','The large data set']),
chapter(2,'Measures of location and spread',['Measures of central tendency','Other measures of location','Measures of spread','Variance and standard deviation','Coding']),
chapter(3,'Representations of data',['Outliers','Box plots','Cumulative frequency','Histograms','Comparing data']),
chapter(4,'Correlation',['Correlation','Linear regression']),
chapter(5,'Probability',['Calculating probabilities','Venn diagrams','Mutually exclusive and independent events','Tree diagrams']),
chapter(6,'Statistical distributions',['Probability distributions','The binomial distribution','Cumulative probabilities']),
chapter(7,'Hypothesis testing',['Hypothesis testing','Finding critical values','One-tailed tests','Two-tailed tests']),
chapter(8,'Modelling in mechanics',['Constructing a model','Modelling assumptions','Quantities and units','Working with vectors']),
chapter(9,'Constant acceleration',['Displacement–time graphs','Velocity–time graphs','Constant acceleration formulae 1','Constant acceleration formulae 2','Vertical motion under gravity']),
chapter(10,'Forces and motion',['Force diagrams','Forces as vectors','Forces and acceleration','Motion in 2 dimensions','Connected particles','Pulleys']),
chapter(11,'Variable acceleration',['Functions of time','Using differentiation','Maxima and minima problems','Using integration','Constant acceleration formulae'])
]),
module('stats_mech_y2','Statistics & Mechanics Year 2',[
chapter(1,'Regression, correlation and hypothesis testing',['Exponential models','Measuring correlation','Hypothesis testing for zero correlation']),
chapter(2,'Conditional probability',['Set notation','Conditional probability','Conditional probabilities in Venn diagrams','Probability formulae','Tree diagrams']),
chapter(3,'The normal distribution',['The normal distribution','Finding probabilities for normal distributions','The inverse normal distribution function','The standard normal distribution','Finding μ and σ','Approximating a binomial distribution','Hypothesis testing with the normal distribution']),
chapter(4,'Moments',['Moments','Resultant moments','Equilibrium','Centres of mass','Tilting']),
chapter(5,'Forces and friction',['Resolving forces','Inclined planes','Friction']),
chapter(6,'Projectiles',['Horizontal projection','Horizontal and vertical components','Projection at any angle','Projectile motion formulae']),
chapter(7,'Applications of forces',['Static particles','Modelling with statics','Friction and static particles','Static rigid bodies','Dynamics and inclined planes','Connected particles']),
chapter(8,'Further kinematics',['Vectors in kinematics','Vector methods with projectiles','Variable acceleration in one dimension','Differentiating vectors','Integrating vectors'])
])
]

export const FURTHER_MATHS_MODULES=[
module('core_pure1','Core Pure 1',[
chapter(1,'Complex numbers',['Imaginary and complex numbers','Multiplying complex numbers','Complex conjugation','Roots of quadratic equations','Solving cubic and quartic equations']),
chapter(2,'Argand diagrams',['Argand diagrams','Modulus and argument','Modulus–argument form of complex numbers','Loci in the Argand diagram','Regions in the Argand diagram']),
chapter(3,'Series',['Sums of natural numbers','Sums of squares and cubes']),
chapter(4,'Roots of polynomials',['Roots of a quadratic equation','Roots of a cubic equation','Roots of a quartic equation','Expressions relating to the roots of a polynomial','Linear transformations of roots']),
chapter(5,'Volumes of revolution',['Volumes of revolution around the x-axis','Volumes of revolution around the y-axis','Adding and subtracting volumes','Modelling with volumes of revolution']),
chapter(6,'Matrices',['Introduction to matrices','Matrix multiplication','Determinants','Inverting a 2 × 2 matrix','Inverting a 3 × 3 matrix','Solving systems of equations using matrices']),
chapter(7,'Linear transformations',['Linear transformations in two dimensions','Reflections and rotations','Enlargements and stretches','Successive transformations','Linear transformations in three dimensions','The inverse of a linear transformation','Finding invariant lines']),
chapter(8,'Proof by induction',['Proof by mathematical induction','Proving divisibility results','Proving statements involving matrices']),
chapter(9,'Vectors',['Equation of a line in three dimensions','Equation of a plane in three dimensions','Scalar product','Calculating angles between lines and planes','Points of intersection','Finding perpendiculars'])
]),
module('core_pure2','Core Pure 2',[
chapter(1,'Complex numbers',['Exponential form of complex numbers','Multiplying and dividing complex numbers',"De Moivre's theorem",'Trigonometric identities','Sums of series','nth roots of a complex number','Solving geometric problems']),
chapter(2,'Series',['The method of differences','Higher derivatives','Maclaurin series','Series expansions of compound functions']),
chapter(3,'Methods in calculus',['Improper integrals','The mean value of a function','Differentiating inverse trigonometric functions','Integrating with inverse trigonometric functions','Integrating using partial fractions']),
chapter(4,'Volumes of revolution',['Volumes of revolution around the x-axis','Volumes of revolution around the y-axis','Volumes of revolution of parametrically defined curves','Modelling with volumes of revolution']),
chapter(5,'Polar coordinates',['Polar coordinates and equations','Sketching curves','Area enclosed by a polar curve','Tangents to polar curves']),
chapter(6,'Hyperbolic functions',['Introduction to hyperbolic functions','Inverse hyperbolic functions','Identities and equations','Differentiating hyperbolic functions','Integrating hyperbolic functions']),
chapter(7,'Methods in differential equations',['First-order differential equations','Second-order homogeneous differential equations','Second-order non-homogeneous differential equations','Using boundary conditions']),
chapter(8,'Modelling with differential equations',['Modelling with first-order differential equations','Simple harmonic motion','Damped and forced harmonic motion','Coupled first-order simultaneous differential equations'])
]),
module('fm1','Further Mechanics 1',[
chapter(1,'Momentum and impulse',['Momentum in one dimension','Conservation of momentum','Momentum as a vector']),
chapter(2,'Work, energy and power',['Work done','Kinetic and potential energy','Conservation of mechanical energy and the work–energy principle','Power']),
chapter(3,'Elastic strings and springs',["Hooke's law and equilibrium problems","Hooke's law and dynamics problem",'Elastic energy','Problems involving elastic energy']),
chapter(4,'Elastic collisions in one dimension',["Direct impact and Newton's law of restitution",'Direct collision with a smooth plane','Loss of kinetic energy','Successive direct impacts']),
chapter(5,'Elastic collisions in two dimensions',['Oblique impact with a fixed surface','Successive oblique impacts','Oblique impact of smooth spheres'])
]),
module('fs1','Further Statistics 1',[
chapter(1,'Discrete random variables',['Expected value of a discrete random variable','Variance of a discrete random variable','Expected value and variance of a function of X','Solving problems involving random variables']),
chapter(2,'Poisson distributions',['The Poisson distribution','Modelling with the Poisson distribution','Adding Poisson distributions','Mean and variance of a Poisson distribution','Mean and variance of the binomial distribution','Using the Poisson distribution to approximate the binomial distribution']),
chapter(3,'Geometric and negative binomial distributions',['The geometric distribution','Mean and variance of a geometric distribution','The negative binomial distribution','Mean and variance of the negative binomial distribution']),
chapter(4,'Hypothesis testing',['Testing for the mean of a Poisson distribution','Finding critical regions for a Poisson distribution','Hypothesis testing for the parameter p of a geometric distribution','Finding critical regions for a geometric distribution']),
chapter(5,'Central limit theorem',['The central limit theorem','Applying the central limit theorem to other distributions']),
chapter(6,'Chi-squared tests',['Goodness of fit','Degrees of freedom and the chi-squared family of distributions','Testing a hypothesis','Testing the goodness of fit with discrete data','Using contingency tables','Apply goodness-of-fit tests to geometric distributions']),
chapter(7,'Probability generating functions',['Probability generating functions','Probability generating functions of standard distributions','Mean and variance of a distribution','Sums of independent random variables']),
chapter(8,'Quality of tests',['Type I and Type II errors','Finding Type I and Type II errors using the normal distribution','Calculate the size and power of a test','The power function'])
])
]

export const A_LEVEL_MATHS_DEFAULT_MODULES=A_LEVEL_MATHS_MODULES.map(m=>m.key)
export const FURTHER_MATHS_DEFAULT_MODULES=['core_pure1','core_pure2']
