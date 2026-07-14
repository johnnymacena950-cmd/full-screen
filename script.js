/**
 * FULL SCREEN - Soluções em Informática
 * JavaScript - Interatividade
 */

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initCursorGlow();
    initMobileMenu();
    initScrollEffects();
    initCounterAnimation();
    initSmoothScroll();
    // Inicializa EmailJS com a chave pública
    if (typeof emailjs !== 'undefined') {
        emailjs.init('azh4RADsWAi8oclLf');
    } else {
        console.error('EmailJS CDN não carregou. Verifique sua conexão.');
    }

    initFormSubmit();
    initPartsForm();
    initWhatsAppFloat();
});

/* ============================================
   FORMULÁRIO DE ENVIO DE PEÇAS
   ============================================ */
function initPartsForm() {
    const form = document.getElementById('partsForm');
    if (!form) return;

    const checkboxes = form.querySelectorAll('input[name="parts"]');
    const selectedCount = document.getElementById('selectedPartsCount');
    const selectedBar = document.getElementById('selectedPartsBar');
    const clearBtn = document.getElementById('clearPartsBtn');
    const phoneInput = document.getElementById('parts-phone');

    // Contador de peças selecionadas
    function updatePartsCount() {
        const checked = form.querySelectorAll('input[name="parts"]:checked');
        const count = checked.length;
        
        if (selectedCount) {
            selectedCount.textContent = count;
            selectedCount.classList.remove('count-pop');
            // Força reflow para reiniciar animação
            void selectedCount.offsetWidth;
            selectedCount.classList.add('count-pop');
        }
        
        if (selectedBar) {
            selectedBar.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    checkboxes.forEach(cb => {
        cb.addEventListener('change', updatePartsCount);
    });

    // Botão limpar seleção
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            checkboxes.forEach(cb => cb.checked = false);
            updatePartsCount();
        });
    }

    // Máscara de telefone
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            if (value.length > 2) {
                value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
            }
            if (value.length > 10) {
                value = `${value.slice(0, 10)}-${value.slice(10)}`;
            }
            
            e.target.value = value;
        });
    }

    // Animação de scroll nos cards de peças (com fallback)
    const partCards = document.querySelectorAll('.part-card');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('part-card-visible');
                    }, index * 40);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        partCards.forEach(card => {
            observer.observe(card);
        });
    } else {
        // Fallback para navegadores sem suporte
        partCards.forEach(card => card.classList.add('part-card-visible'));
    }

    // Submissão do formulário - Envio via Email + WhatsApp
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = form.querySelector('.btn-submit-parts');
        const originalHTML = btn.innerHTML;

        // Coleta os dados do formulário
        const name = document.getElementById('parts-name').value.trim();
        const phone = document.getElementById('parts-phone').value.trim();
        const email = document.getElementById('parts-email').value.trim();
        const equipType = document.getElementById('parts-equip-type');
        const equipTypeText = equipType.options[equipType.selectedIndex]?.text || '';
        const brand = document.getElementById('parts-brand').value.trim();
        const model = document.getElementById('parts-model').value.trim();
        const serial = document.getElementById('parts-serial').value.trim();
        
        const checkedParts = [];
        form.querySelectorAll('input[name="parts"]:checked').forEach(cb => {
            checkedParts.push(cb.value);
        });

        const urgency = document.getElementById('parts-urgency');
        const urgencyText = urgency.options[urgency.selectedIndex]?.text || '';
        const serviceType = document.getElementById('parts-service-type');
        const serviceTypeText = serviceType.options[serviceType.selectedIndex]?.text || '';
        const description = document.getElementById('parts-description').value.trim();

        // Estado de loading
        btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="spin-icon">
                <circle cx="12" cy="12" r="10" stroke-dasharray="31.4" stroke-dashoffset="10"/>
            </svg>
            <span>Enviando...</span>
        `;
        btn.style.pointerEvents = 'none';
        btn.classList.add('btn-loading');

        // Monta a mensagem formatada para o WhatsApp
        let whatsappMsg = '🧑‍💼 *NOVO PEDIDO DE ORÇAMENTO* 🧑‍💼\n\n';
        whatsappMsg += '─────────────────────\n';
        whatsappMsg += '*📋 DADOS DO CLIENTE*\n';
        whatsappMsg += '─────────────────────\n';
        whatsappMsg += `👤 *Nome:* ${name}\n`;
        whatsappMsg += `📞 *Telefone:* ${phone}\n`;
        if (email) whatsappMsg += `📧 *E-mail:* ${email}\n`;
        whatsappMsg += '\n─────────────────────\n';
        whatsappMsg += '*💻 EQUIPAMENTO*\n';
        whatsappMsg += '─────────────────────\n';
        whatsappMsg += `📌 *Tipo:* ${equipTypeText}\n`;
        if (brand) whatsappMsg += `🏷️ *Marca:* ${brand}\n`;
        if (model) whatsappMsg += `📋 *Modelo:* ${model}\n`;
        if (serial) whatsappMsg += `🔢 *Nº Série:* ${serial}\n`;
        whatsappMsg += '\n─────────────────────\n';
        whatsappMsg += '*🔧 PEÇAS PARA ENVIO*\n';
        whatsappMsg += '─────────────────────\n';
        if (checkedParts.length > 0) {
            checkedParts.forEach((part, i) => {
                whatsappMsg += `  ${i + 1}. ${part}\n`;
            });
        } else {
            whatsappMsg += '  Nenhuma peça selecionada\n';
        }
        whatsappMsg += '\n─────────────────────\n';
        whatsappMsg += '*⚡ SERVIÇO*\n';
        whatsappMsg += '─────────────────────\n';
        whatsappMsg += `⏱️ *Urgência:* ${urgencyText}\n`;
        whatsappMsg += `🔨 *Tipo:* ${serviceTypeText}\n`;
        if (description) {
            whatsappMsg += `\n📝 *Descrição:*\n${description}\n`;
        }
        whatsappMsg += '\n─────────────────────\n';
        whatsappMsg += '✅ *Aguardando retorno!*';

        // Monta a mensagem formatada para o e-mail (sem markdown do WhatsApp)
        let emailMsg = 'NOVO PEDIDO DE ORÇAMENTO\n\n';
        emailMsg += '─────────────────────\n';
        emailMsg += '📋 DADOS DO CLIENTE\n';
        emailMsg += '─────────────────────\n';
        emailMsg += `Nome: ${name}\n`;
        emailMsg += `Telefone: ${phone}\n`;
        if (email) emailMsg += `E-mail: ${email}\n`;
        emailMsg += '\n─────────────────────\n';
        emailMsg += '💻 EQUIPAMENTO\n';
        emailMsg += '─────────────────────\n';
        emailMsg += `Tipo: ${equipTypeText}\n`;
        if (brand) emailMsg += `Marca: ${brand}\n`;
        if (model) emailMsg += `Modelo: ${model}\n`;
        if (serial) emailMsg += `Nº Série: ${serial}\n`;
        emailMsg += '\n─────────────────────\n';
        emailMsg += '🔧 PEÇAS PARA ENVIO\n';
        emailMsg += '─────────────────────\n';
        if (checkedParts.length > 0) {
            checkedParts.forEach((part, i) => {
                emailMsg += `  ${i + 1}. ${part}\n`;
            });
        } else {
            emailMsg += '  Nenhuma peça selecionada\n';
        }
        emailMsg += '\n─────────────────────\n';
        emailMsg += '⚡ SERVIÇO\n';
        emailMsg += '─────────────────────\n';
        emailMsg += `Urgência: ${urgencyText}\n`;
        emailMsg += `Tipo: ${serviceTypeText}\n`;
        if (description) {
            emailMsg += `\n📝 Descrição:\n${description}\n`;
        }
        emailMsg += '\n─────────────────────\n';
        emailMsg += '✅ Aguardando retorno!';

        // 1. ENVIA E-MAIL VIA EMAILJS
        emailjs.send('service_osdicfc', 'template_8difevs', {
            name: name,
            email: email || 'Não informado',
            phone: phone,
            from_subject: `Orçamento - ${serviceTypeText}`,
            message: emailMsg,
        }).then(() => {
            // 2. E-MAIL ENVIADO - ABRE WHATSAPP PARA O CLIENTE
            const encodedMessage = encodeURIComponent(whatsappMsg);
            const whatsappUrl = `https://wa.me/5585997713219?text=${encodedMessage}`;

            const win = window.open(whatsappUrl, '_blank');
            if (!win || win.closed) {
                window.location.href = whatsappUrl;
            }

            // Mostra estado de sucesso
            btn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Orçamento Enviado! ✅</span>
            `;
            btn.classList.remove('btn-loading');
            btn.classList.add('btn-success');

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.pointerEvents = 'auto';
                btn.classList.remove('btn-success');
                form.reset();
                updatePartsCount();
            }, 5000);
        }, (error) => {
            // Erro ao enviar e-mail
            console.error('Erro ao enviar e-mail do orçamento:', error);
            btn.innerHTML = `
                <span>Erro ao enviar! Tente novamente</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" stroke="#ff5f57" stroke-width="2"/>
                    <line x1="7" y1="7" x2="13" y2="13" stroke="#ff5f57" stroke-width="2"/>
                    <line x1="13" y1="7" x2="7" y2="13" stroke="#ff5f57" stroke-width="2"/>
                </svg>
            `;
            btn.classList.remove('btn-loading');

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.pointerEvents = 'auto';
            }, 4000);
        });
    });
}

/* ============================================
   PARTÍCULAS DE FUNDO
   ============================================ */
function initParticles() {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');

    let particles = [];
    const maxParticles = 60;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', () => {
        resize();
        particles = [];
        createParticles();
    });

    function createParticles() {
        for (let i = 0; i < maxParticles; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 1.5 + 0.5,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.5 + 0.1,
            });
        }
    }

    createParticles();

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, i) => {
            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 229, 255, ${p.opacity})`;
            ctx.fill();

            // Linhas entre partículas próximas
            particles.forEach((p2, j) => {
                if (i >= j) return;
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(0, 229, 255, ${0.03 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            });
        });

        requestAnimationFrame(animate);
    }

    animate();
}

/* ============================================
   CURSOR GLOW (DESKTOP)
   ============================================ */
function initCursorGlow() {
    if (window.innerWidth < 768) return;

    const glow = document.querySelector('.cursor-glow');
    glow.style.display = 'block';

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function update() {
        currentX += (mouseX - currentX) * 0.08;
        currentY += (mouseY - currentY) * 0.08;
        glow.style.left = currentX + 'px';
        glow.style.top = currentY + 'px';
        requestAnimationFrame(update);
    }

    update();
}

/* ============================================
   MENU MOBILE
   ============================================ */
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

/* ============================================
   EFEITOS DE SCROLL
   ============================================ */
function initScrollEffects() {
    const header = document.querySelector('.header');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    // Header shadow on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active nav link
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

/* ============================================
   ANIMAÇÃO DE CONTADORES
   ============================================ */
function initCounterAnimation() {
    const statNumbers = document.querySelectorAll('.stat-number');
    let animated = false;

    function animateCounters() {
        if (animated) return;

        const statsBar = document.querySelector('.stats-bar');
        if (!statsBar) return;

        const rect = statsBar.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            animated = true;

            statNumbers.forEach(stat => {
                const target = parseInt(stat.dataset.target);
                const duration = 2000;
                const startTime = performance.now();

                function update(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // easing
                    const eased = 1 - Math.pow(1 - progress, 3);
                    stat.textContent = Math.floor(eased * target);

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    } else {
                        stat.textContent = target;
                    }
                }

                requestAnimationFrame(update);
            });
        }
    }

    window.addEventListener('scroll', animateCounters);
    animateCounters(); // check on load too
}

/* ============================================
   SMOOTH SCROLL PARA LINKS
   ============================================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;

            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
        });
    });
}

/* ============================================
   WHATSAPP FLOATING BUTTON
   ============================================ */
function initWhatsAppFloat() {
    const whatsappBtn = document.getElementById('whatsappFloat');
    if (!whatsappBtn) return;

    let lastScroll = 0;
    const scrollThreshold = 100;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        
        if (currentScroll > scrollThreshold && currentScroll > lastScroll) {
            // Scrolling down past threshold - hide
            whatsappBtn.classList.add('whatsapp-hidden');
        } else {
            // Scrolling up or at top - show
            whatsappBtn.classList.remove('whatsapp-hidden');
        }
        
        lastScroll = currentScroll;
    });
}

/* ============================================
   FORMULÁRIO DE CONTATO
   ============================================ */
function initFormSubmit() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = form.querySelector('.btn-submit');
        const originalHTML = btn.innerHTML;
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const subject = document.getElementById('subject');
        const subjectText = subject.options[subject.selectedIndex]?.text || '';
        const message = document.getElementById('message').value.trim();

        // Estado de loading
        btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="spin-icon">
                <circle cx="12" cy="12" r="10" stroke-dasharray="31.4" stroke-dashoffset="10"/>
            </svg>
            <span>Enviando...</span>
        `;
        btn.style.pointerEvents = 'none';
        btn.classList.add('btn-loading');

        // Envia via EmailJS
        emailjs.send('service_osdicfc', 'template_8difevs', {
            name: name,
            email: email,
            phone: phone,
            from_subject: subjectText,
            message: message,
        }).then(() => {
            btn.innerHTML = `
                <span>Mensagem Enviada! ✅</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 10l3 3l7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            btn.classList.remove('btn-loading');
            btn.classList.add('btn-success');
            btn.style.borderColor = '#28c840';
            btn.style.boxShadow = '0 0 30px rgba(40, 200, 64, 0.3)';

            form.reset();

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.pointerEvents = 'auto';
                btn.classList.remove('btn-success');
                btn.style.borderColor = '';
                btn.style.boxShadow = '';
            }, 4000);
        }, (error) => {
            console.error('Erro ao enviar email:', error);
            btn.innerHTML = `
                <span>Erro ao enviar! Tente novamente</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" stroke="#ff5f57" stroke-width="2"/>
                    <line x1="7" y1="7" x2="13" y2="13" stroke="#ff5f57" stroke-width="2"/>
                    <line x1="13" y1="7" x2="7" y2="13" stroke="#ff5f57" stroke-width="2"/>
                </svg>
            `;
            btn.classList.remove('btn-loading');

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.pointerEvents = 'auto';
            }, 4000);
        });
    });
}
