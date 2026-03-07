document.addEventListener('DOMContentLoaded', () => {
    // --- BÚSQUEDA EN TABLA ---
    const searchInput = document.getElementById('searchInput');
    const tableRows = document.querySelectorAll('.ticket-row');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            tableRows.forEach(row => {
                const refCode = row.querySelector('.ref-code').textContent.toLowerCase();
                row.style.display = refCode.includes(term) ? '' : 'none';
            });
        });
    }

    // --- MODAL DE DETALLE DE TICKET (WORKSPACE) ---
    const ticketModal = document.getElementById('ticketModal');
    const ticketModalContent = document.getElementById('ticketModalContent');
    const closeTicketModal = document.getElementById('closeTicketModal');
    
    const mRefCode = document.getElementById('m-refcode');
    const mSubject = document.getElementById('m-subject');

    const openTicketModal = (ref, subject) => {
        if (!ticketModal) return;
        mRefCode.textContent = ref;
        mSubject.textContent = subject;
        ticketModal.classList.remove('hidden');
        // Efecto fadeIn
        setTimeout(() => {
            ticketModal.classList.remove('opacity-0');
            ticketModalContent.classList.remove('scale-95');
        }, 10);
    };

    const hideTicketModal = () => {
        if (!ticketModal) return;
        ticketModal.classList.add('opacity-0');
        ticketModalContent.classList.add('scale-95');
        setTimeout(() => ticketModal.classList.add('hidden'), 300);
    };

    if (tableRows.length > 0) {
        tableRows.forEach(row => {
            row.addEventListener('click', () => {
                const ref = row.getAttribute('data-ref');
                const subject = row.querySelector('.ticket-subject').textContent;
                openTicketModal(ref, subject);
            });
        });
    }

    if (closeTicketModal) {
        closeTicketModal.addEventListener('click', hideTicketModal);
    }
    
    if (ticketModal) {
        ticketModal.addEventListener('click', (e) => {
            if(e.target === ticketModal) hideTicketModal();
        });
    }

    // --- LÓGICA DEL WIDGET (SIMULACIÓN REFERENCE CODE) ---
    const widgetContainer = document.getElementById('widgetContainer');
    const closeWidget = document.getElementById('closeWidget');
    const reopenWidget = document.getElementById('reopenWidget');
    
    const wForm = document.getElementById('widgetForm');
    const wSuccess = document.getElementById('widgetSuccess');
    const wSubmit = document.getElementById('w-submit');
    const wReset = document.getElementById('w-reset');
    const generatedRefCode = document.getElementById('generatedRefCode');

    if (closeWidget && widgetContainer && reopenWidget) {
        closeWidget.addEventListener('click', () => {
            widgetContainer.classList.add('scale-0', 'opacity-0');
            setTimeout(() => {
                widgetContainer.classList.add('hidden');
                reopenWidget.classList.remove('hidden');
            }, 300);
        });

        reopenWidget.addEventListener('click', () => {
            reopenWidget.classList.add('hidden');
            widgetContainer.classList.remove('hidden');
            setTimeout(() => widgetContainer.classList.remove('scale-0', 'opacity-0'), 10);
        });
    }

    if (wSubmit) {
        wSubmit.addEventListener('click', () => {
            const type = document.getElementById('w-type').value;
            const email = document.getElementById('w-email').value;
            const subject = document.getElementById('w-subject').value;

            if(!type || !email || !subject) {
                alert('Llena todos los campos para probar la simulación.');
                return;
            }

            wSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';
            
            setTimeout(() => {
                // Simula tu tarea SCRUM-10: Reference Code Engine
                const randomId = Math.random().toString(36).substring(2, 7).toUpperCase();
                generatedRefCode.textContent = `#REF-${randomId}`;
                
                wForm.classList.add('hidden');
                wSuccess.classList.remove('hidden');
                wSuccess.classList.add('flex');
                wSubmit.textContent = 'Enviar Ticket';
            }, 800);
        });
    }

    if (wReset) {
        wReset.addEventListener('click', () => {
            document.getElementById('w-type').value = '';
            document.getElementById('w-email').value = '';
            document.getElementById('w-subject').value = '';
            document.getElementById('w-desc').value = '';
            wSuccess.classList.add('hidden');
            wSuccess.classList.remove('flex');
            wForm.classList.remove('hidden');
        });
    }

    // --- LÓGICA DE MODAL DE RASTREO PÚBLICO (OTP) ---
    const trackerModal = document.getElementById('trackerModal');
    const btnPublicTracker = document.getElementById('btn-public-tracker');
    const closeTracker = document.getElementById('closeTracker');
    
    const step1 = document.getElementById('trackerStep1');
    const step2 = document.getElementById('trackerStep2');
    const step3 = document.getElementById('trackerStep3');
    
    const btnSearchTicket = document.getElementById('btnSearchTicket');
    const btnRequestOtp = document.getElementById('btnRequestOtp');
    const inputPublicRef = document.getElementById('publicRefCode');

    if (btnPublicTracker && trackerModal) {
        btnPublicTracker.addEventListener('click', () => trackerModal.classList.remove('hidden'));
    }

    if (closeTracker && trackerModal) {
        closeTracker.addEventListener('click', () => {
            trackerModal.classList.add('hidden');
            // Reset states
            step1.classList.remove('hidden');
            step2.classList.add('hidden');
            step3.classList.add('hidden');
            inputPublicRef.value = '';
        });
    }

    if (btnSearchTicket) {
        btnSearchTicket.addEventListener('click', () => {
            if(inputPublicRef.value.length < 5) return alert('Ingresa un código válido');
            btnSearchTicket.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Buscando...';
            setTimeout(() => {
                step1.classList.add('hidden');
                step2.classList.remove('hidden');
                btnSearchTicket.textContent = 'Buscar Ticket';
            }, 600);
        });
    }

    if (btnRequestOtp) {
        btnRequestOtp.addEventListener('click', () => {
            btnRequestOtp.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generando OTP...';
            setTimeout(() => {
                step2.classList.add('hidden');
                step3.classList.remove('hidden');
                btnRequestOtp.textContent = 'Enviar OTP a mi correo';
            }, 800);
        });
    }

    // Auto-focus inputs OTP
    if (step3) {
        const otpInputs = step3.querySelectorAll('input');
        otpInputs.forEach((input, index) => {
            input.addEventListener('input', () => {
                if (input.value.length === 1 && index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            });
        });
    }
});