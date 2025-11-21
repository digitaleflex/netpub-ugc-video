import { useEffect } from 'react';
import { gsap } from 'gsap';

// Helper functions
function lerp(a: number, b: number, n: number): number {
  return (1 - n) * a + n * b;
}

function getLocalPointerPos(e: MouseEvent | TouchEvent, rect: DOMRect): { x: number; y: number } {
  let clientX = 0;
  let clientY = 0;
  if (e instanceof TouchEvent && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if (e instanceof MouseEvent) {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

function getMouseDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.hypot(dx, dy);
}

// ImageItem class
class ImageItem {
  DOM: { el: HTMLElement; inner: HTMLElement };
  defaultStyle = { scale: 1, x: 0, y: 0, opacity: 0 };
  rect: DOMRect | null = null;

  constructor(DOM_el: HTMLElement) {
    this.DOM = { el: DOM_el, inner: DOM_el.querySelector('.content__img-inner')! };
    this.getRect();
    this.initEvents();
  }

  initEvents() {
    const resize = () => {
      gsap.set(this.DOM.el, this.defaultStyle);
      this.getRect();
    };
    window.addEventListener('resize', resize);
  }

  getRect() {
    this.rect = this.DOM.el.getBoundingClientRect();
  }
}

// Base class for variants
class ImageTrailVariant {
  container: HTMLElement;
  DOM: { el: HTMLElement };
  images: ImageItem[];
  imagesTotal: number;
  imgPosition: number;
  zIndexVal: number;
  activeImagesCount: number;
  isIdle: boolean;
  threshold: number;
  mousePos: { x: number; y: number };
  lastMousePos: { x: number; y: number };
  cacheMousePos: { x: number; y: number };
  renderLoop: number | null = null;

  // Store listener references for cleanup
  private handlePointerMove: (ev: MouseEvent | TouchEvent) => void;
  private initRender: (ev: MouseEvent | TouchEvent) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.DOM = { el: container };
    this.images = [...(this.DOM.el.querySelectorAll('.content__img') as NodeListOf<HTMLElement>)].map(
      (img) => new ImageItem(img)
    );
    this.imagesTotal = this.images.length;
    this.imgPosition = 0;
    this.zIndexVal = 1;
    this.activeImagesCount = 0;
    this.isIdle = true;
    this.threshold = 80;

    this.mousePos = { x: 0, y: 0 };
    this.lastMousePos = { x: 0, y: 0 };
    this.cacheMousePos = { x: 0, y: 0 };

    // Bind methods and store them
    this.handlePointerMove = (ev: MouseEvent | TouchEvent) => {
      const rect = this.container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
    };
    
    this.initRender = (ev: MouseEvent | TouchEvent) => {
      const rect = this.container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
      this.cacheMousePos = { ...this.mousePos };

      this.renderLoop = requestAnimationFrame(() => this.render());

      window.removeEventListener('mousemove', this.initRender);
      window.removeEventListener('touchmove', this.initRender);
    };

    this.init();
  }

  init() {
    window.addEventListener('mousemove', this.handlePointerMove);
    window.addEventListener('touchmove', this.handlePointerMove);
    window.addEventListener('mousemove', this.initRender);
    window.addEventListener('touchmove', this.initRender);
  }

  render() {
    // To be implemented by subclasses
  }

  onImageActivated() {
    this.activeImagesCount++;
    this.isIdle = false;
  }

  onImageDeactivated() {
    this.activeImagesCount--;
    if (this.activeImagesCount === 0) {
      this.isIdle = true;
    }
  }
  
  destroy() {
    if (this.renderLoop) {
        cancelAnimationFrame(this.renderLoop);
    }
    window.removeEventListener('mousemove', this.handlePointerMove);
    window.removeEventListener('touchmove', this.handlePointerMove);
    window.removeEventListener('mousemove', this.initRender);
    window.removeEventListener('touchmove', this.initRender);
  }
}

// Variant 2
class ImageTrailVariant2 extends ImageTrailVariant {
  render() {
    let distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);

    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zIndexVal !== 1) {
      this.zIndexVal = 1;
    }
    this.renderLoop = requestAnimationFrame(() => this.render());
  }

  showNextImage() {
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    if (!img.rect) return;

    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated(),
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 0,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2,
        },
        {
          duration: 0.4,
          ease: 'power1',
          scale: 1,
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2,
        },
        0
      )
      .fromTo(
        img.DOM.inner,
        {
          scale: 2.8,
          filter: 'brightness(250%)',
        },
        {
          duration: 0.4,
          ease: 'power1',
          scale: 1,
          filter: 'brightness(100%)',
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.4,
          ease: 'power2',
          opacity: 0,
          scale: 0.2,
        },
        0.45
      );
  }
}

export const useImageTrail = (containerRef: React.RefObject<HTMLElement>, items: string[]) => {
  useEffect(() => {
    if (!containerRef.current || items.length === 0) return;

    const instance = new ImageTrailVariant2(containerRef.current);

    return () => {
      instance.destroy();
    };
  }, [items, containerRef]);
};
