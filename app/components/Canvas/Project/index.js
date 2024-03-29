import { Plane, Transform } from 'ogl'
import GSAP from 'gsap'

import map from 'lodash/map.js'

import Media from './Media.js'

export default class {
  constructor ({ gl, scene, sizes }) {
    this.gl = gl
    this.scene = scene
    this.sizes = sizes

    this.group = new Transform()

    this.galleryElement = document.querySelector('.project__content__gallery')
    this.mediasElements = document.querySelectorAll('.project__gallery__media__image')

    this.y = {
      current: 0,
      target: 0,
      lerp: 0.07
    }

    this.scrollCurrent = {
      x: 0,
      y: 0
    }

    this.scroll = {
      x: 0,
      y: 0
    }

    this.speed = {
      current: 0,
      target: 0,
      lerp: 0.07
    }

    this.velocity = 2

    this.createGeometry()
    this.createGallery()

    this.onResize({
      sizes: this.sizes
    })
  }

  createGeometry () {
    this.geometry = new Plane(this.gl, {
      heightSegments: 20,
      widthSegments: 20
    })
  }

  createGallery () {
    this.medias = map(this.mediasElements, (element, index) => {
      return new Media({
        element,
        geometry: this.geometry,
        index,
        gl: this.gl,
        scene: this.group,
        sizes: this.sizes
      })
    })
  }

  /**
   * Animations.
   */
  show (isPreloaded) {
    this.group.setParent(this.scene)

    map(this.medias, media => media.show(isPreloaded))
  }

  hide () {
    this.group.setParent(null)

    map(this.medias, media => media.hide())
  }

  destroy() {
    this.scene.removeChild(this.group)
  }

  /**
   * Events.
   */
  onResize (event) {
    const h = document.querySelector('.project__wrapper').clientHeight - window.innerHeight

    this.pageHeight = h

    this.galleryBounds = this.galleryElement.getBoundingClientRect()

    this.sizes = event.sizes

    this.gallerySizes = {
      height: this.galleryBounds.height / window.innerHeight * this.sizes.height,
      width: this.galleryBounds.width / window.innerWidth * this.sizes.width
    }

    this.scroll.y = this.y.target = 0

    map(this.medias, media => media.onResize(event, this.scroll))

  }

  onTouchDown ({ y }) {
    this.scrollCurrent.y = this.scroll.y
  }

  onTouchMove ({ y }) {
    const yDistance = (y.start - y.end) * 3

    this.y.target = this.scrollCurrent.y - yDistance
  }

  onTouchUp ({ y }) {

  }

  onWheel ({ pixelY }) {
    this.y.target -= pixelY

    this.velocity = pixelY > 0 ? 2 : -2
  }

  /**
   * Update.
   */
  update () {
    this.y.target = GSAP.utils.clamp(-this.pageHeight, 0, this.y.target)


    this.speed.target = (this.y.target - this.y.current) * 0.003



    this.speed.current = GSAP.utils.interpolate(this.speed.current, this.speed.target, this.speed.lerp)

    this.y.current = GSAP.utils.interpolate(this.y.current, this.y.target, this.y.lerp)
    this.y.current = Math.ceil(this.y.current)

    this.scroll.y = this.y.current


    map(this.medias, (media, index) => {
      media.update(this.scroll, this.speed.current)
    })
  }

  /**
   * Destroy.
   */
  destroy () {
    this.scene.removeChild(this.group)
  }
}
