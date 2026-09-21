/* =========================================
   ANKUSH CINEFILMS — JAVASCRIPT CONTROLLER
   Theme Switcher, Scoped Lightbox by Folder/Section,
   Fullscreen Reel View & Interactive Media Controls
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       1. THEME SWITCHER (DARK / LIGHT THEME)
       ========================================= */
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const currentTheme = localStorage.getItem("ankush_theme") || "dark";

    function applyTheme(theme) {
        if (theme === "light") {
            document.body.classList.add("light-theme");
            if (themeToggleBtn) {
                themeToggleBtn.querySelector(".theme-icon").textContent = "☀️";
                themeToggleBtn.querySelector(".theme-label").textContent = "Light";
            }
        } else {
            document.body.classList.remove("light-theme");
            if (themeToggleBtn) {
                themeToggleBtn.querySelector(".theme-icon").textContent = "🌙";
                themeToggleBtn.querySelector(".theme-label").textContent = "Dark";
            }
        }
        localStorage.setItem("ankush_theme", theme);
    }

    applyTheme(currentTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const isLight = document.body.classList.contains("light-theme");
            applyTheme(isLight ? "dark" : "light");
        });
    }


    /* =========================================
       2. CUSTOM CURSOR
       ========================================= */
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (!isTouchDevice) {
        const cursorDot = document.createElement("div");
        cursorDot.className = "custom-cursor-dot";
        document.body.appendChild(cursorDot);

        const cursorCircle = document.createElement("div");
        cursorCircle.className = "custom-cursor-circle";
        document.body.appendChild(cursorCircle);

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let circleX = mouseX;
        let circleY = mouseY;

        window.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        }, { passive: true });

        function animateCursor() {
            circleX += (mouseX - circleX) * 0.16;
            circleY += (mouseY - circleY) * 0.16;

            cursorCircle.style.left = `${circleX}px`;
            cursorCircle.style.top = `${circleY}px`;

            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hover expansions
        const interactiveSelectors = "a, button, input, select, textarea, .gallery-item, .project-card, .service-card, .direct-card, .showreel-card, .project-gallery-btn, .modal-img-card, .modal-reel-card";
        
        document.addEventListener("mouseover", (e) => {
            if (e.target.closest(interactiveSelectors)) {
                document.body.classList.add("cursor-hover");
            }
        });

        document.addEventListener("mouseout", (e) => {
            if (e.target.closest(interactiveSelectors)) {
                document.body.classList.remove("cursor-hover");
            }
        });

        document.addEventListener("mouseleave", () => {
            cursorDot.style.opacity = "0";
            cursorCircle.style.opacity = "0";
        });

        document.addEventListener("mouseenter", () => {
            cursorDot.style.opacity = "1";
            cursorCircle.style.opacity = "1";
        });
    }


    /* =========================================
       3. NAVBAR SCROLL & MOBILE DRAWER
       ========================================= */
    const navbar = document.querySelector(".navbar");
    const menuButton = document.querySelector(".menu-button");
    const navLinks = document.querySelector(".nav-links");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 40) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    }, { passive: true });

    if (menuButton && navLinks) {
        menuButton.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("active");
            menuButton.classList.toggle("active", isOpen);
            menuButton.setAttribute("aria-expanded", isOpen);
            document.body.classList.toggle("menu-open", isOpen);
        });

        navLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("active");
                menuButton.classList.remove("active");
                menuButton.setAttribute("aria-expanded", "false");
                document.body.classList.remove("menu-open");
            });
        });
    }


    /* =========================================
       4. FULLSCREEN HELPER FUNCTION
       ========================================= */
    function triggerFullscreen(element) {
        if (!element) return;
        const video = element.tagName === "VIDEO" ? element : element.querySelector("video");

        // iOS Safari native video fullscreen
        if (video && video.webkitEnterFullscreen) {
            video.webkitEnterFullscreen();
            return;
        }

        const target = element;
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            if (target.requestFullscreen) {
                target.requestFullscreen().catch(() => {});
            } else if (target.webkitRequestFullscreen) {
                target.webkitRequestFullscreen();
            } else if (target.mozRequestFullScreen) {
                target.mozRequestFullScreen();
            } else if (target.msRequestFullscreen) {
                target.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }


    /* =========================================
       5. SHOWREEL VIDEO GRID (PLAY WITH MUSIC & FULLSCREEN)
       ========================================= */
    const showreelCards = document.querySelectorAll(".showreel-card");
    const allShowreelVideos = document.querySelectorAll(".showreel-card video");

    function formatTime(seconds) {
        if (isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function pauseAllShowreelVideos(exceptVideo = null) {
        allShowreelVideos.forEach((vid) => {
            if (vid !== exceptVideo && !vid.paused) {
                vid.pause();
                const card = vid.closest(".showreel-card");
                if (card) {
                    card.classList.remove("is-playing");
                    const playBtn = card.querySelector(".showreel-play-overlay .play-icon");
                    if (playBtn) playBtn.textContent = "▶";
                    const ctrlPlay = card.querySelector(".ctrl-play-btn");
                    if (ctrlPlay) ctrlPlay.textContent = "▶";
                }
            }
        });
    }

    showreelCards.forEach((card) => {
        const video = card.querySelector("video");
        const playOverlay = card.querySelector(".showreel-play-overlay");
        const playIcon = playOverlay ? playOverlay.querySelector(".play-icon") : null;
        const ctrlPlayBtn = card.querySelector(".ctrl-play-btn");
        const ctrlMuteBtn = card.querySelector(".ctrl-mute-btn");
        const timeDisplay = card.querySelector(".showreel-time");
        const fsBtn = card.querySelector(".ctrl-fs-btn");
        const pillFsBtn = card.querySelector(".reel-fullscreen-pill-btn");
        const mediaWrap = card.querySelector(".showreel-media-wrap");

        if (!video) return;

        function toggleVideoPlayback(e) {
            if (e && e.target.closest(".showreel-ctrl-bar button, .reel-fullscreen-pill-btn")) return;
            
            if (video.paused) {
                pauseAllShowreelVideos(video);

                // Play with music/sound enabled
                video.muted = false;
                video.volume = 1.0;

                video.play().then(() => {
                    card.classList.add("is-playing");
                    if (playIcon) playIcon.textContent = "⏸";
                    if (ctrlPlayBtn) ctrlPlayBtn.textContent = "⏸";
                    if (ctrlMuteBtn) ctrlMuteBtn.textContent = "🔊";
                }).catch(() => {
                    // Autoplay restriction fallback
                    video.muted = true;
                    video.play().then(() => {
                        card.classList.add("is-playing");
                        if (playIcon) playIcon.textContent = "⏸";
                        if (ctrlPlayBtn) ctrlPlayBtn.textContent = "⏸";
                        if (ctrlMuteBtn) ctrlMuteBtn.textContent = "🔇";
                    });
                });
            } else {
                video.pause();
                card.classList.remove("is-playing");
                if (playIcon) playIcon.textContent = "▶";
                if (ctrlPlayBtn) ctrlPlayBtn.textContent = "▶";
            }
        }

        if (mediaWrap) mediaWrap.addEventListener("click", toggleVideoPlayback);
        if (playOverlay) playOverlay.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleVideoPlayback();
        });

        if (ctrlPlayBtn) {
            ctrlPlayBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                toggleVideoPlayback();
            });
        }

        if (ctrlMuteBtn) {
            ctrlMuteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                video.muted = !video.muted;
                ctrlMuteBtn.textContent = video.muted ? "🔇" : "🔊";
            });
        }

        if (fsBtn) {
            fsBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                triggerFullscreen(mediaWrap || video);
            });
        }

        if (pillFsBtn) {
            pillFsBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                triggerFullscreen(mediaWrap || video);
            });
        }

        video.addEventListener("timeupdate", () => {
            if (timeDisplay && video.duration) {
                timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
            }
        });

        video.addEventListener("loadedmetadata", () => {
            if (timeDisplay && video.duration) {
                timeDisplay.textContent = `00:00 / ${formatTime(video.duration)}`;
            }
        });

        video.addEventListener("ended", () => {
            card.classList.remove("is-playing");
            if (playIcon) playIcon.textContent = "▶";
            if (ctrlPlayBtn) ctrlPlayBtn.textContent = "▶";
        });
    });


    /* =========================================
       6. PROJECT SHOWCASE MODALS (LORIINI & POJ)
          VIDEOS MUTED WITH FULLSCREEN BUTTON
       ========================================= */
    const modalTriggers = document.querySelectorAll("[data-open-modal]");
    const projectModals = document.querySelectorAll(".project-modal");

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        pauseAllShowreelVideos();

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";

        // Keep videos muted by default
        modal.querySelectorAll("video").forEach((v) => {
            v.muted = true;
        });
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";

        // Pause any playing videos inside this modal
        modal.querySelectorAll("video").forEach((v) => {
            v.pause();
            const reelCard = v.closest(".modal-reel-card");
            if (reelCard) reelCard.classList.remove("is-playing");
        });
    }

    modalTriggers.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const targetModalId = btn.getAttribute("data-open-modal");
            openModal(targetModalId);
        });
    });

    projectModals.forEach((modal) => {
        const closeBtn = modal.querySelector(".modal-close-btn");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => closeModal(modal));
        }

        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });

        // Reel playback & Fullscreen inside modal
        const reelCards = modal.querySelectorAll(".modal-reel-card");
        reelCards.forEach((card) => {
            const vid = card.querySelector("video");
            const playBtn = card.querySelector(".modal-reel-play-btn");
            const mediaBox = card.querySelector(".modal-reel-media");
            const fsBtn = card.querySelector(".reel-fullscreen-pill-btn");

            if (!vid) return;
            vid.muted = true; // explicitly muted per user requirement

            function toggleReel() {
                if (vid.paused) {
                    modal.querySelectorAll("video").forEach((other) => {
                        if (other !== vid && !other.paused) {
                            other.pause();
                            const otherCard = other.closest(".modal-reel-card");
                            if (otherCard) otherCard.classList.remove("is-playing");
                        }
                    });

                    vid.muted = true;
                    vid.play().then(() => {
                        card.classList.add("is-playing");
                        if (playBtn) playBtn.textContent = "⏸";
                    }).catch(() => {});
                } else {
                    vid.pause();
                    card.classList.remove("is-playing");
                    if (playBtn) playBtn.textContent = "▶";
                }
            }

            if (mediaBox) {
                mediaBox.addEventListener("click", (e) => {
                    if (e.target.closest(".reel-fullscreen-pill-btn")) return;
                    toggleReel();
                });
            }

            if (playBtn) {
                playBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    toggleReel();
                });
            }

            // User requested: "ADD A BUTTON IN EACH REEL TO MAKE IT FULL SCREEN VIEW"
            if (fsBtn) {
                fsBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    triggerFullscreen(mediaBox || vid);
                });
            }

            vid.addEventListener("ended", () => {
                card.classList.remove("is-playing");
                if (playBtn) playBtn.textContent = "▶";
            });
        });
    });


    /* =========================================
       7. SCOPED LIGHTBOX ENGINE
          STRICTLY CONFINED TO CURRENT FOLDER / SECTION
       ========================================= */
    const lightboxModal = document.getElementById("lightboxModal");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxTitle = document.getElementById("lightboxTitle");
    const lightboxSpecs = document.getElementById("lightboxSpecs");
    const lightboxCounter = document.getElementById("lightboxCounter");
    const lightboxCloseBtn = document.getElementById("lightboxCloseBtn");
    const lightboxPrevBtn = document.getElementById("lightboxPrevBtn");
    const lightboxNextBtn = document.getElementById("lightboxNextBtn");

    // Dynamic scoped array of current images: [{ src, title, specs }]
    let currentLightboxList = [];
    let currentLightboxIndex = 0;

    function updateLightboxDisplay() {
        if (!currentLightboxList.length) return;
        const item = currentLightboxList[currentLightboxIndex];

        lightboxImg.src = item.src;
        lightboxImg.alt = item.title || "Photograph";
        if (lightboxTitle) lightboxTitle.textContent = item.title || "";
        if (lightboxSpecs) lightboxSpecs.textContent = item.specs || "";
        if (lightboxCounter) {
            lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${currentLightboxList.length}`;
        }
    }

    function openScopedLightbox(itemsArray, startIndex = 0) {
        if (!itemsArray || itemsArray.length === 0) return;
        currentLightboxList = itemsArray;
        currentLightboxIndex = (startIndex >= 0 && startIndex < itemsArray.length) ? startIndex : 0;

        updateLightboxDisplay();

        lightboxModal.classList.add("is-open");
        lightboxModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        if (!lightboxModal) return;
        lightboxModal.classList.remove("is-open");
        lightboxModal.setAttribute("aria-hidden", "true");
        // Keep body overflow hidden only if a project modal is still open
        const isProjectModalOpen = document.querySelector(".project-modal.is-open");
        if (!isProjectModalOpen) {
            document.body.style.overflow = "";
        }
    }

    function nextLightbox() {
        if (!currentLightboxList.length) return;
        currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxList.length;
        updateLightboxDisplay();
    }

    function prevLightbox() {
        if (!currentLightboxList.length) return;
        currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxList.length) % currentLightboxList.length;
        updateLightboxDisplay();
    }

    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener("click", closeLightbox);
    if (lightboxNextBtn) lightboxNextBtn.addEventListener("click", (e) => { e.stopPropagation(); nextLightbox(); });
    if (lightboxPrevBtn) lightboxPrevBtn.addEventListener("click", (e) => { e.stopPropagation(); prevLightbox(); });

    if (lightboxModal) {
        lightboxModal.addEventListener("click", (e) => {
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });
    }

    // Keyboard navigation (Arrow keys for scoped lightbox, Escape for modal/lightbox)
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (lightboxModal && lightboxModal.classList.contains("is-open")) {
                closeLightbox();
                return;
            }
            projectModals.forEach((modal) => {
                if (modal.classList.contains("is-open")) {
                    closeModal(modal);
                }
            });
        }
        if (lightboxModal && lightboxModal.classList.contains("is-open")) {
            if (e.key === "ArrowRight") nextLightbox();
            if (e.key === "ArrowLeft") prevLightbox();
        }
    });


    /* =========================================
       8. WIRING SCOPED IMAGES FOR EACH SECTION
       ========================================= */

    // Scope A: LORIINI WORKS MODAL IMAGES (Only cycles within Loriini Works!)
    const loriiniModalEl = document.getElementById("loriiniModal");
    if (loriiniModalEl) {
        const loriiniImgCards = Array.from(loriiniModalEl.querySelectorAll(".modal-img-card"));
        loriiniImgCards.forEach((card, index) => {
            card.addEventListener("click", () => {
                const scopedItems = loriiniImgCards.map((c) => ({
                    src: c.getAttribute("data-src") || c.querySelector("img").src,
                    title: c.getAttribute("data-title") || c.querySelector(".modal-img-caption")?.textContent?.trim() || "Loriini Skincare Master",
                    specs: c.getAttribute("data-specs") || "Loriini Skincare · Commercial Photography"
                }));
                openScopedLightbox(scopedItems, index);
            });
        });
    }

    // Scope B: PEOPLE OF JAMSHEDPUR MODAL IMAGES (Only cycles within POJ!)
    const pojModalEl = document.getElementById("pojModal");
    if (pojModalEl) {
        const pojImgCards = Array.from(pojModalEl.querySelectorAll(".modal-img-card"));
        pojImgCards.forEach((card, index) => {
            card.addEventListener("click", () => {
                const scopedItems = pojImgCards.map((c) => ({
                    src: c.getAttribute("data-src") || c.querySelector("img").src,
                    title: c.getAttribute("data-title") || c.querySelector(".modal-img-caption")?.textContent?.trim() || "People of Jamshedpur Archive",
                    specs: c.getAttribute("data-specs") || "People of Jamshedpur · Documentary Story"
                }));
                openScopedLightbox(scopedItems, index);
            });
        });
    }

    // Scope C: CAPTURED FRAMES (Only cycles within currently active category tab/folder!)
    const filterButtons = document.querySelectorAll(".filter-btn");
    const allGalleryCards = Array.from(document.querySelectorAll("#galleryGrid .gallery-item"));

    // Filter tabs switching
    filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterButtons.forEach((b) => {
                b.classList.remove("active");
                b.setAttribute("aria-selected", "false");
            });
            btn.classList.add("active");
            btn.setAttribute("aria-selected", "true");

            const filterValue = btn.getAttribute("data-filter");

            allGalleryCards.forEach((item) => {
                const category = item.getAttribute("data-category");
                if (filterValue === "all" || category === filterValue) {
                    item.style.display = "";
                    setTimeout(() => {
                        item.style.opacity = "1";
                        item.style.transform = "translateY(0)";
                    }, 30);
                } else {
                    item.style.opacity = "0";
                    item.style.transform = "translateY(16px)";
                    setTimeout(() => {
                        item.style.display = "none";
                    }, 250);
                }
            });
        });
    });

    // Clicking any gallery card only opens the photos belonging to the currently active folder!
    allGalleryCards.forEach((item) => {
        item.addEventListener("click", () => {
            const activeFilterBtn = document.querySelector(".gallery-filters .filter-btn.active");
            const activeFilter = activeFilterBtn ? activeFilterBtn.getAttribute("data-filter") : "all";

            // Filter cards strictly matching the active album tab
            const activeScopedCards = allGalleryCards.filter((card) => {
                if (activeFilter === "all") return true;
                return card.getAttribute("data-category") === activeFilter;
            });

            const scopedItems = activeScopedCards.map((c) => ({
                src: c.getAttribute("data-src") || c.querySelector("img").src,
                title: c.getAttribute("data-title") || "Captured Frame",
                specs: c.getAttribute("data-specs") || ""
            }));

            const clickedIndex = activeScopedCards.indexOf(item);
            openScopedLightbox(scopedItems, clickedIndex >= 0 ? clickedIndex : 0);
        });
    });


    /* =========================================
       9. CONTACT INQUIRY FORM (OPTION 2 + OPTION 3)
       1-Click Instant WhatsApp Redirect + Direct Email Backup
       ========================================= */
    const inquiryForm = document.getElementById("inquiryForm");
    const formFeedback = document.getElementById("formFeedback");
    const btnSubmitWhatsApp = document.getElementById("btnSubmitWhatsApp");
    const btnSubmitEmail = document.getElementById("btnSubmitEmail");

    function getFormData() {
        const nameInput = document.getElementById("formName");
        const emailInput = document.getElementById("formEmail");
        const serviceInput = document.getElementById("formService");
        const phoneInput = document.getElementById("formPhone");
        const messageInput = document.getElementById("formMessage");

        const name = nameInput ? nameInput.value.trim() : "";
        const email = emailInput ? emailInput.value.trim() : "";
        const service = serviceInput ? serviceInput.value : "Cinematography";
        const phone = phoneInput ? phoneInput.value.trim() : "";
        const message = messageInput ? messageInput.value.trim() : "";

        if (!name) {
            alert("Please enter your name.");
            if (nameInput) nameInput.focus();
            return null;
        }
        if (!email) {
            alert("Please enter your email address.");
            if (emailInput) emailInput.focus();
            return null;
        }
        if (!message) {
            alert("Please enter your project details & vision.");
            if (messageInput) messageInput.focus();
            return null;
        }

        const formattedMessage = 
`✨ *NEW PROJECT INQUIRY — ANKUSH KUMAR THAKUR*
━━━━━━━━━━━━━━━━━━━━
👤 *Client Name:* ${name}
📧 *Email Address:* ${email}
📞 *Phone / WhatsApp:* ${phone || 'N/A'}
🎬 *Service Needed:* ${service}

📋 *Project Vision & Details:*
${message}
━━━━━━━━━━━━━━━━━━━━`;

        const waUrl = `https://wa.me/918544007761?text=${encodeURIComponent(formattedMessage)}`;
        const mailtoUrl = `mailto:ankushkumar1312005@gmail.com?subject=${encodeURIComponent(`Project Inquiry: ${service} — ${name}`)}&body=${encodeURIComponent(formattedMessage)}`;

        return { name, email, service, phone, message, waUrl, mailtoUrl, formattedMessage };
    }

    function sendViaWhatsApp() {
        const data = getFormData();
        if (!data) return;

        // Option 2: 1-Click Instant WhatsApp redirect in new window/tab
        window.open(data.waUrl, "_blank");

        if (formFeedback) {
            formFeedback.className = "form-feedback success";
            formFeedback.innerHTML = `
                <p><strong>✅ WhatsApp Chat Launched!</strong> Your inquiry has been pre-filled for Ankush Kumar Thakur (<strong>+91 8544007761</strong>). Simply tap <em>Send</em> in WhatsApp to deliver immediately.</p>
                <div class="form-feedback-actions">
                    <a href="${data.waUrl}" target="_blank" rel="noopener noreferrer" class="feedback-btn feedback-btn-wa">Reopen WhatsApp 💬</a>
                    <a href="${data.mailtoUrl}" class="feedback-btn feedback-btn-mail">Also Send via Email ✉️</a>
                </div>
            `;
            formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    function sendViaEmail() {
        const data = getFormData();
        if (!data) return;

        // Option 3: Direct Email app launch
        window.location.href = data.mailtoUrl;

        if (formFeedback) {
            formFeedback.className = "form-feedback success";
            formFeedback.innerHTML = `
                <p><strong>✉️ Email Client Opened!</strong> Your message has been prepared for <strong>ankushkumar1312005@gmail.com</strong>.</p>
                <div class="form-feedback-actions">
                    <a href="${data.waUrl}" target="_blank" rel="noopener noreferrer" class="feedback-btn feedback-btn-wa">Send via WhatsApp as well 💬</a>
                    <a href="${data.mailtoUrl}" class="feedback-btn feedback-btn-mail">Reopen Email ✉️</a>
                </div>
            `;
            formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    if (inquiryForm) {
        // Form submit (hitting Enter on any field) defaults to 1-Click WhatsApp redirect
        inquiryForm.addEventListener("submit", (e) => {
            e.preventDefault();
            sendViaWhatsApp();
        });
    }

    if (btnSubmitWhatsApp) {
        btnSubmitWhatsApp.addEventListener("click", (e) => {
            e.preventDefault();
            sendViaWhatsApp();
        });
    }

    if (btnSubmitEmail) {
        btnSubmitEmail.addEventListener("click", (e) => {
            e.preventDefault();
            sendViaEmail();
        });
    }


    /* =========================================
       10. LIVE INDIAN STANDARD TIME (IST) CLOCK
       ========================================= */
    const clockElement = document.getElementById("liveIstClock");

    function updateIstClock() {
        if (!clockElement) return;
        const now = new Date();
        const options = {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        };
        const timeString = new Intl.DateTimeFormat("en-GB", options).format(now);
        clockElement.textContent = `Jamshedpur, IN · ${timeString} IST`;
    }

    updateIstClock();
    setInterval(updateIstClock, 1000);


    /* =========================================
       11. SCROLL REVEAL ANIMATIONS
       ========================================= */
    const revealElements = document.querySelectorAll(".reveal-on-scroll");

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-revealed");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: "0px 0px -40px 0px"
        });

        revealElements.forEach((el) => revealObserver.observe(el));
    } else {
        revealElements.forEach((el) => el.classList.add("is-revealed"));
    }


    /* =========================================
       12. BACK TO TOP BUTTON
       ========================================= */
    const backToTopBtn = document.getElementById("backToTopBtn");
    if (backToTopBtn) {
        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }


    /* =========================================
       13. AMBIENT CURSOR-INTERACTIVE PARTICLES
       Natural, low-opacity, professional particle field
       Adapts dynamically between Dark & Light themes
       ========================================= */
    const particleCanvas = document.getElementById("ambientParticlesCanvas");
    if (particleCanvas) {
        const ctx = particleCanvas.getContext("2d");
        let dpr = window.devicePixelRatio || 1;
        let width = window.innerWidth;
        let height = window.innerHeight;
        let animationFrameId = null;
        let isRunning = true;

        function resizeCanvas() {
            dpr = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;
            particleCanvas.width = width * dpr;
            particleCanvas.height = height * dpr;
            particleCanvas.style.width = width + "px";
            particleCanvas.style.height = height + "px";
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resizeCanvas();

        const mouse = {
            x: -9999,
            y: -9999,
            radius: 135,
            active: false
        };

        window.addEventListener("mousemove", (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.active = true;
        }, { passive: true });

        window.addEventListener("touchmove", (e) => {
            if (e.touches && e.touches[0]) {
                mouse.x = e.touches[0].clientX;
                mouse.y = e.touches[0].clientY;
                mouse.active = true;
            }
        }, { passive: true });

        window.addEventListener("touchend", () => {
            mouse.active = false;
        }, { passive: true });

        document.addEventListener("mouseleave", () => {
            mouse.active = false;
        });

        // Determine particle count based on viewport size (~30 on mobile, ~70 on desktop)
        const count = Math.min(Math.max(Math.floor((width * height) / 22000), 30), 75);
        const particles = [];

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                baseVx: (Math.random() - 0.5) * 0.45,
                baseVy: (Math.random() - 0.5) * 0.45,
                vx: (Math.random() - 0.5) * 0.45,
                vy: (Math.random() - 0.5) * 0.45,
                radius: 1.0 + Math.random() * 1.4, // delicate 1.0px to 2.4px
                baseAlpha: 0.12 + Math.random() * 0.16, // subtle 0.12 to 0.28
                alpha: 0.15,
                pulseSpeed: 0.012 + Math.random() * 0.02,
                pulsePhase: Math.random() * Math.PI * 2,
                isAccent: Math.random() > 0.82 // 18% accent particles
            });
        }

        function renderParticles() {
            if (!isRunning) return;

            ctx.clearRect(0, 0, width, height);

            const isLight = document.body.classList.contains("light-theme");

            // Colors based on active theme
            // Dark theme: soft starlight / chalk white with subtle lime accents
            // Light theme: soft charcoal / graphite with subtle cobalt accents
            const baseColor = isLight ? "35, 40, 52" : "242, 242, 238";
            const accentColor = isLight ? "0, 82, 204" : "200, 255, 0";

            // Update and draw particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Breathing luminescence
                p.pulsePhase += p.pulseSpeed;
                const breathingFactor = 0.85 + Math.sin(p.pulsePhase) * 0.25;
                let currentAlpha = p.baseAlpha * breathingFactor;

                // Mouse proximity interaction (gentle natural hover & deflection)
                if (mouse.active) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const dist = Math.hypot(dx, dy);

                    if (dist < mouse.radius && dist > 0) {
                        const force = (1 - dist / mouse.radius);
                        // Gentle repulsive push
                        p.vx += (dx / dist) * force * 0.42;
                        p.vy += (dy / dist) * force * 0.42;
                        // Natural luminescent highlight on hover
                        currentAlpha = Math.min(currentAlpha + force * 0.22, 0.45);
                    }
                }

                // Damping back toward natural slow drift
                p.vx = p.vx * 0.94 + p.baseVx * 0.06;
                p.vy = p.vy * 0.94 + p.baseVy * 0.06;

                p.x += p.vx;
                p.y += p.vy;

                // Soft screen wrapping with margin
                const margin = 20;
                if (p.x < -margin) p.x = width + margin;
                if (p.x > width + margin) p.x = -margin;
                if (p.y < -margin) p.y = height + margin;
                if (p.y > height + margin) p.y = -margin;

                // Render particle circle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                const rgb = p.isAccent ? accentColor : baseColor;
                ctx.fillStyle = `rgba(${rgb}, ${currentAlpha.toFixed(3)})`;
                ctx.fill();

                // Connect nearby particles with ultra-faint aesthetic lines
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const ldx = p.x - p2.x;
                    const ldy = p.y - p2.y;
                    const lineDist = Math.hypot(ldx, ldy);

                    if (lineDist < 85) {
                        const lineAlpha = (1 - lineDist / 85) * (isLight ? 0.045 : 0.055);
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(${baseColor}, ${lineAlpha.toFixed(4)})`;
                        ctx.lineWidth = 0.7;
                        ctx.stroke();
                    }
                }

                // Very soft connection to mouse if nearby
                if (mouse.active) {
                    const mdx = p.x - mouse.x;
                    const mdy = p.y - mouse.y;
                    const mDist = Math.hypot(mdx, mdy);
                    if (mDist < 95) {
                        const mouseLineAlpha = (1 - mDist / 95) * (isLight ? 0.06 : 0.08);
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = `rgba(${accentColor}, ${mouseLineAlpha.toFixed(4)})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(renderParticles);
        }

        renderParticles();

        // Window resize throttle
        let resizeTimeout = null;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeCanvas, 150);
        });

        // Tab visibility optimization (pause when user switches tabs)
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                isRunning = false;
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
            } else {
                isRunning = true;
                animationFrameId = requestAnimationFrame(renderParticles);
            }
        });
    }

});