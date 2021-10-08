export default class Modifier {
  static createPuddle(prng) {
    return new Modifier('PUDDLE', {
      transform: `translateX(-50%) translateY(-50%) rotate(${prng.rand(360)}deg)`,
      filter: `hue-rotate(${prng.rand(360)}deg)`,
    });
  }

  static createDust(prng) {
    return new Modifier('DUST', {
      transform: `translateX(-50%) translateY(-50%) rotate(${prng.rand(360)}deg)`,
      opacity: '80%',
    });
  }

  constructor(name, additionalStyles = {}) {
    this.name = name;
    this.additionalStyles = additionalStyles;
  }
}