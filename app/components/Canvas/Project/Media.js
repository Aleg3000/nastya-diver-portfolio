import GSAP from 'gsap'
import { Mesh, Program, Texture } from 'ogl'

import fragment from 'shaders/plane-fragment.glsl'
import vertex from 'shaders/plane-vertex.glsl'

export default class {
  constructor ({ element, geometry, gl, index, scene, sizes }) {
    this.element = element
    this.geometry = geometry
    this.gl = gl
    this.index = index
    this.scene = scene
    this.sizes = sizes


    this.extra = {
      // x: 0,
      y: 0
    }

    this.createTexture()
    this.createProgram()
    this.createMesh()
    this.createBounds({
      sizes: this.sizes
    })

  }

  createTexture () {
    // const image = this.element

    // this.texture = image.getAttribute('data-src')

    this.texture = new Texture(this.gl)

    // const image = this.element.querySelector('img')

    this.image = new Image()
    this.image.crossOrigin = 'anonymous'
    this.image.src = this.element.getAttribute('data-src')
    this.element.style.opacity = 0
    this.image.onload = _ => (this.texture.image = this.image)
  }

  createProgram () {
    this.program = new Program(this.gl, {
      fragment,
      vertex,
      uniforms: {
        uAlpha: { value: 0 },
        uSpeed: { value: 0 },
        uViewportSizes: { value: [this.sizes.width, this.sizes.height] },
        tMap: { value: this.texture }
      }
    })
  }

  createMesh () {
    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    })

    this.mesh.setParent(this.scene)
    // this.mesh.rotation.z = GSAP.utils.random(-Math.PI * 0.03, Math.PI * 0.03)
  }

  createBounds ({ sizes }) {
    this.sizes = sizes

    this.bounds = this.element.getBoundingClientRect()


    this.updateScale()
    // this.updateX()
    this.updateY()
  }

  /**
   * Animations.
   */
  show (isPreloaded) {
    const delay = isPreloaded ? 1 : 0

    this.timelineIn = GSAP.timeline({
      delay: GSAP.utils.random(delay, delay + 1.5)
    })

    this.timelineIn.fromTo(this.program.uniforms.uAlpha, {
      value: 0
    }, {
      duration: 2,
      ease: 'expo.inOut',
      value: 1
    }, 'start')

    this.timelineIn.fromTo(this.mesh.position, {
      z: GSAP.utils.random(2, 6)
    }, {
      duration: 2,
      ease: 'expo.inOut',
      z: 0
    }, 'start')
  }

  hide () {
    // this.program.uniforms.uAlpha = 0
    GSAP.fromTo(this.program.uniforms.uAlpha,{value: 1}, {
      duration: 0.5,
      ease: 'expo.inOut',
      value: 0,
    })
  }

  /**
   * Events.
   */
  onResize (sizes, scroll) {
    this.extra = {
      // x: 0,
      y: 0
    }

    this.createBounds(sizes)
    // this.updateX(scroll && scroll.x)
    this.updateY(scroll && scroll.y)
  }

  /**
   * Loop.
   */
  updateScale () {
    this.height = this.bounds.height / window.innerHeight
    this.width = this.bounds.width / window.innerWidth

    this.mesh.scale.x = this.sizes.width * this.width
    this.mesh.scale.y = this.sizes.height * this.height
  }

  // updateX (x = 0) {
  //   this.x = (this.bounds.left + x) / window.innerWidth

  //   this.mesh.position.x = (-this.sizes.width / 2) + (this.mesh.scale.x / 2) + (this.x * this.sizes.width) + this.extra.x
  // }

  updateY (y = 0) {
    this.y = (this.bounds.top + y) / window.innerHeight

    this.mesh.position.y = (this.sizes.height / 2) - (this.mesh.scale.y / 2) - (this.y * this.sizes.height) + this.extra.y
  }

  update (scroll, speed) {
    // this.updateX()
    this.updateY(scroll.y)

    this.program.uniforms.uSpeed.value = speed
  }
}
