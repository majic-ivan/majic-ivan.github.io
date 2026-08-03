const mobileMenu = document.getElementById('mobile-menu');
const navList = document.querySelector('.nav-list');

if (mobileMenu && navList) {
    mobileMenu.addEventListener('click', () => {
        navList.classList.toggle('active');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const fadeInElements = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible'); // Fade in when in view
            } else {
                entry.target.classList.remove('visible'); // Fade out when out of view
            }
        });
    });

    fadeInElements.forEach((el) => observer.observe(el));

    initPhotoCarousels();
});
document.addEventListener("DOMContentLoaded", function() {
    const user = "ivan.majic";
    const domain = "ucl.ac.uk";
    const email = user + "@" + domain;
    const emailLink = '<a href="mailto:' + email + '">' + email + '</a>';
    const emailElem = document.getElementById("email");
    if (emailElem) emailElem.innerHTML = emailLink;
});

function initPhotoCarousels() {
    const carousels = document.querySelectorAll('[data-carousel]');

    carousels.forEach((carousel) => {
        const carouselShell = carousel.querySelector('.carousel-shell');
        const viewport = carousel.querySelector('[data-carousel-viewport]');
        const prevButton = carousel.querySelector('[data-carousel-prev]');
        const nextButton = carousel.querySelector('[data-carousel-next]');
        const fullscreenButton = carousel.querySelector('[data-carousel-fullscreen]');

        if (!carouselShell || !viewport) {
            return;
        }

        const shellHomeParent = carouselShell.parentNode;
        const shellHomeNextSibling = carouselShell.nextSibling;

        const originalSlides = Array.from(viewport.querySelectorAll('.carousel-slide'));

        if (originalSlides.length === 0) {
            return;
        }

        const createLoopingCarousel = (targetViewport, slideTemplates, controls = {}, options = {}) => {
            const slideCount = slideTemplates.length;
            const clonedSlides = [
                slideTemplates[slideCount - 1].cloneNode(true),
                ...slideTemplates.map((slide) => slide.cloneNode(true)),
                slideTemplates[0].cloneNode(true)
            ];

            targetViewport.replaceChildren(...clonedSlides);

            let currentIndex = 0;
            let pendingIndex = null;
            let settleTimer = null;
            let isAnimating = false;

            const getVisibleIndex = () => Math.round(targetViewport.scrollLeft / targetViewport.clientWidth);

            const normalizeVisibleIndex = (visibleIndex) => {
                if (visibleIndex <= 0) {
                    return slideCount - 1;
                }

                if (visibleIndex >= slideCount + 1) {
                    return 0;
                }

                return visibleIndex - 1;
            };

            const jumpToVisibleIndex = (visibleIndex) => {
                const previousSnapType = targetViewport.style.scrollSnapType;
                const previousScrollBehavior = targetViewport.style.scrollBehavior;
                const targetSlide = targetViewport.children.item(visibleIndex);
                const targetLeft = targetSlide ? targetSlide.offsetLeft : visibleIndex * targetViewport.clientWidth;

                targetViewport.style.scrollSnapType = 'none';
                targetViewport.style.scrollBehavior = 'auto';
                targetViewport.scrollTo({ left: targetLeft, behavior: 'auto' });

                requestAnimationFrame(() => {
                    targetViewport.style.scrollSnapType = previousSnapType;
                    targetViewport.style.scrollBehavior = previousScrollBehavior;
                });
            };

            const scrollToVisibleIndex = (visibleIndex, behavior = 'smooth') => {
                const targetSlide = targetViewport.children.item(visibleIndex);
                const targetLeft = targetSlide ? targetSlide.offsetLeft : visibleIndex * targetViewport.clientWidth;
                targetViewport.scrollTo({ left: targetLeft, behavior });
            };

            const syncIndex = () => {
                const visibleIndex = getVisibleIndex();

                if (visibleIndex <= 0) {
                    jumpToVisibleIndex(slideCount);
                    currentIndex = slideCount - 1;
                    if (options.onChange) {
                        options.onChange(currentIndex);
                    }
                    return;
                }

                if (visibleIndex >= slideCount + 1) {
                    jumpToVisibleIndex(1);
                    currentIndex = 0;
                    if (options.onChange) {
                        options.onChange(currentIndex);
                    }
                    return;
                }

                currentIndex = visibleIndex - 1;
                if (options.onChange) {
                    options.onChange(currentIndex);
                }
            };

            const scheduleSync = () => {
                if (settleTimer !== null) {
                    window.clearTimeout(settleTimer);
                }

                settleTimer = window.setTimeout(() => {
                    syncIndex();
                    pendingIndex = null;
                    isAnimating = false;
                }, 120);
            };

            targetViewport.addEventListener('scroll', scheduleSync, { passive: true });
            window.addEventListener('resize', syncIndex);

            const step = (direction) => {
                if (isAnimating) {
                    return;
                }

                isAnimating = true;
                pendingIndex = null;

                if (direction > 0) {
                    const visibleTarget = currentIndex === slideCount - 1 ? slideCount + 1 : currentIndex + 2;
                    pendingIndex = visibleTarget === slideCount + 1 ? 0 : currentIndex + 1;
                    scrollToVisibleIndex(visibleTarget);
                    return;
                }

                const visibleTarget = currentIndex === 0 ? 0 : currentIndex;
                pendingIndex = currentIndex === 0 ? slideCount - 1 : currentIndex - 1;
                scrollToVisibleIndex(visibleTarget);
            };

            if (controls.prevButton) {
                controls.prevButton.addEventListener('click', () => step(-1));
            }

            if (controls.nextButton) {
                controls.nextButton.addEventListener('click', () => step(1));
            }

            requestAnimationFrame(() => {
                if (targetViewport.clientWidth > 0) {
                    jumpToVisibleIndex(1);
                    currentIndex = 0;
                }
            });

            return {
                getCurrentIndex: () => currentIndex,
                getActiveIndex: () => pendingIndex ?? normalizeVisibleIndex(getVisibleIndex()),
                openAtIndex: (index) => {
                    const normalizedIndex = ((index % slideCount) + slideCount) % slideCount;
                    scrollToVisibleIndex(normalizedIndex + 1, 'auto');
                    currentIndex = normalizedIndex;
                    pendingIndex = null;
                    if (options.onChange) {
                        options.onChange(currentIndex);
                    }
                    targetViewport.focus();
                },
            };
        };

        const mainCarousel = createLoopingCarousel(viewport, originalSlides, {
            prevButton,
            nextButton,
        });

        let overlay = null;
        let overlayStage = null;
        let overlayCarousel = null;
        let overlayShell = null;
        let fullscreenOpen = false;

        const ensureOverlay = () => {
            if (overlay) {
                return overlay;
            }

            overlay = document.createElement('div');
            overlay.className = 'carousel-overlay';
            overlay.hidden = true;
            overlay.innerHTML = [
                '<div class="carousel-overlay-panel" role="dialog" aria-modal="true" aria-label="Fullscreen photo viewer">',
                '  <button type="button" class="carousel-overlay-close" data-carousel-close>Close</button>',
                '  <div class="carousel-overlay-carousel" data-overlay-stage></div>',
                '</div>'
            ].join('');
            document.body.appendChild(overlay);

            const closeButton = overlay.querySelector('[data-carousel-close]');
            overlayStage = overlay.querySelector('[data-overlay-stage]');

            const closeOverlay = () => {
                if (fullscreenOpen) {
                    overlayCarousel = null;
                    overlayShell = null;
                    overlayStage.replaceChildren();
                    fullscreenOpen = false;
                    if (fullscreenButton) {
                        fullscreenButton.disabled = false;
                    }
                }

                overlay.hidden = true;
                document.body.classList.remove('carousel-open');
            };

            const openCarousel = (index) => {
                overlay.hidden = false;
                document.body.classList.add('carousel-open');
                overlayStage.replaceChildren();
                overlayShell = document.createElement('div');
                overlayShell.className = 'carousel-shell';
                overlayShell.innerHTML = [
                    '<button class="carousel-button carousel-button-prev" type="button" data-carousel-prev aria-label="Previous photo">&#10094;</button>',
                    '<div class="carousel-viewport" data-carousel-viewport aria-label="Montenegro photo carousel fullscreen"></div>',
                    '<button class="carousel-button carousel-button-next" type="button" data-carousel-next aria-label="Next photo">&#10095;</button>'
                ].join('');
                overlayStage.appendChild(overlayShell);

                const overlayViewport = overlayShell.querySelector('[data-carousel-viewport]');
                const overlayPrevButton = overlayShell.querySelector('[data-carousel-prev]');
                const overlayNextButton = overlayShell.querySelector('[data-carousel-next]');
                overlayCarousel = createLoopingCarousel(overlayViewport, originalSlides, {
                    prevButton: overlayPrevButton,
                    nextButton: overlayNextButton,
                });

                overlayCarousel.openAtIndex(index);
                fullscreenOpen = true;

                if (fullscreenButton) {
                    fullscreenButton.disabled = true;
                }
            };

            if (closeButton) {
                closeButton.addEventListener('click', closeOverlay);
            }

            overlay.addEventListener('click', (event) => {
                if (event.target === overlay) {
                    closeOverlay();
                }
            });

            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && overlay && !overlay.hidden) {
                    closeOverlay();
                }
            });

            overlay.openCarousel = openCarousel;
            return overlay;
        };

        if (fullscreenButton) {
            fullscreenButton.addEventListener('click', () => {
                const activeOverlay = ensureOverlay();
                activeOverlay.openCarousel(mainCarousel.getActiveIndex());
            });
        }
    });
}