// PawPlan - Veterinary Membership Platform
// Main JavaScript functionality

class PawPlanApp {
    constructor() {
        this.currentUser = null;
        this.demoMode = false;
        this.vetPlans = [];
        this.clients = [];
        this.currentPlan = null;
        this.init();
    }

    init() {
        this.loadDemoData();
        this.setupEventListeners();
        this.checkDemoMode();
        this.initializeCurrentPage();
    }

    // Demo data initialization
    loadDemoData() {
        if (!localStorage.getItem('pawplan_demo_data')) {
            const demoData = {
                vetPlans: [
                    {
                        id: 'plan_001',
                        name: 'Essential Care',
                        price: 49,
                        services: ['Annual Exam', 'Vaccinations', 'Flea/Tick Prevention'],
                        description: 'Basic preventive care for healthy pets',
                        clientCount: 12,
                        revenue: 588
                    },
                    {
                        id: 'plan_002',
                        name: 'Premium Wellness',
                        price: 89,
                        services: ['Annual Exam', 'Vaccinations', 'Dental Cleaning', 'Blood Work', 'Unlimited Consultations'],
                        description: 'Comprehensive care for optimal pet health',
                        clientCount: 8,
                        revenue: 712
                    }
                ],
                clients: [
                    {
                        id: 'client_001',
                        name: 'Sarah Johnson',
                        email: 'sarah.j@email.com',
                        pets: ['Max (Golden Retriever)', 'Luna (Cat)'],
                        plan: 'Premium Wellness',
                        joinDate: '2024-01-15'
                    },
                    {
                        id: 'client_002',
                        name: 'Mike Chen',
                        email: 'mike.chen@email.com',
                        pets: ['Bella (Beagle)'],
                        plan: 'Essential Care',
                        joinDate: '2024-02-03'
                    }
                ]
            };
            localStorage.setItem('pawplan_demo_data', JSON.stringify(demoData));
        }
        
        const stored = JSON.parse(localStorage.getItem('pawplan_demo_data'));
        this.vetPlans = stored.vetPlans || [];
        this.clients = stored.clients || [];
    }

    // Demo mode management
    toggleDemoMode() {
        this.demoMode = !this.demoMode;
        localStorage.setItem('pawplan_demo_mode', this.demoMode);
        this.updateDemoIndicator();
        location.reload();
    }

    checkDemoMode() {
        this.demoMode = localStorage.getItem('pawplan_demo_mode') === 'true';
        this.updateDemoIndicator();
    }

    updateDemoIndicator() {
        const indicator = document.getElementById('demo-indicator');
        if (indicator) {
            indicator.style.display = this.demoMode ? 'block' : 'none';
        }
    }

    // Navigation
    navigateTo(page) {
        window.location.href = page;
    }

    // Vet Dashboard Functions
    initializeVetDashboard() {
        this.renderVetPlans();
        this.renderClientList();
        this.updateRevenueMetrics();
        this.setupPlanBuilder();
    }

    setupPlanBuilder() {
        const planNameInput = document.getElementById('plan-name');
        const planPriceInput = document.getElementById('plan-price');
        const serviceCheckboxes = document.querySelectorAll('input[name="services"]');
        
        const updatePreview = () => {
            const name = planNameInput?.value || 'New Plan';
            const price = parseInt(planPriceInput?.value) || 0;
            const selectedServices = Array.from(serviceCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
            
            this.updatePlanPreview(name, price, selectedServices);
        };
        
        planNameInput?.addEventListener('input', updatePreview);
        planPriceInput?.addEventListener('input', updatePreview);
        serviceCheckboxes?.forEach(cb => cb.addEventListener('change', updatePreview));
    }

    updatePlanPreview(name, price, services) {
        const previewCard = document.getElementById('plan-preview');
        if (previewCard) {
            previewCard.innerHTML = `
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-xl font-bold text-gray-800">${name}</h3>
                        <span class="text-2xl font-bold text-blue-600">$${price}/month</span>
                    </div>
                    <div class="space-y-2">
                        ${services.map(service => `
                            <div class="flex items-center text-sm text-gray-600">
                                <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                </svg>
                                ${service}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    createVetPlan() {
        const name = document.getElementById('plan-name')?.value;
        const price = parseInt(document.getElementById('plan-price')?.value);
        const selectedServices = Array.from(document.querySelectorAll('input[name="services"]:checked'))
            .map(cb => cb.value);
        
        if (!name || !price || selectedServices.length === 0) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }
        
        const newPlan = {
            id: 'plan_' + Date.now(),
            name,
            price,
            services: selectedServices,
            description: 'Custom veterinary care plan',
            clientCount: 0,
            revenue: 0
        };
        
        this.vetPlans.push(newPlan);
        this.saveDemoData();
        this.renderVetPlans();
        this.updateRevenueMetrics();
        
        // Reset form
        document.getElementById('plan-name').value = '';
        document.getElementById('plan-price').value = '';
        document.querySelectorAll('input[name="services"]').forEach(cb => cb.checked = false);
        document.getElementById('plan-preview').innerHTML = '<p class="text-gray-500 text-center">Plan preview will appear here</p>';
        
        this.showNotification('Plan created successfully!', 'success');
    }

    generateShareLink(planId) {
        const link = `${window.location.origin}/client-signup.html?planId=${planId}`;
        navigator.clipboard.writeText(link);
        this.showNotification('Share link copied to clipboard!', 'success');
    }

    renderVetPlans() {
        const container = document.getElementById('vet-plans');
        if (!container) return;
        
        container.innerHTML = this.vetPlans.map(plan => `
            <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-bold text-gray-800">${plan.name}</h3>
                    <span class="text-2xl font-bold text-blue-600">$${plan.price}/month</span>
                </div>
                <p class="text-gray-600 mb-4">${plan.description}</p>
                <div class="space-y-2 mb-4">
                    ${plan.services.map(service => `
                        <div class="flex items-center text-sm text-gray-600">
                            <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                            </svg>
                            ${service}
                        </div>
                    `).join('')}
                </div>
                <div class="flex justify-between items-center pt-4 border-t">
                    <div class="text-sm text-gray-500">
                        ${plan.clientCount} clients • $${plan.revenue} monthly revenue
                    </div>
                    <button onclick="app.generateShareLink('${plan.id}')" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Share Plan
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderClientList() {
        const container = document.getElementById('client-list');
        if (!container) return;
        
        container.innerHTML = this.clients.map(client => `
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center mb-4">
                    <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span class="text-blue-600 font-bold text-lg">${client.name.charAt(0)}</span>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-gray-800">${client.name}</h3>
                        <p class="text-gray-600">${client.email}</p>
                    </div>
                </div>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Plan:</span>
                        <span class="font-medium">${client.plan}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Pets:</span>
                        <span class="font-medium">${client.pets.length}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Member since:</span>
                        <span class="font-medium">${new Date(client.joinDate).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateRevenueMetrics() {
        const totalRevenue = this.vetPlans.reduce((sum, plan) => sum + plan.revenue, 0);
        const totalClients = this.vetPlans.reduce((sum, plan) => sum + plan.clientCount, 0);
        
        const revenueElement = document.getElementById('total-revenue');
        const clientsElement = document.getElementById('total-clients');
        
        if (revenueElement) revenueElement.textContent = `$${totalRevenue}`;
        if (clientsElement) clientsElement.textContent = totalClients;
    }

    // Client Signup Functions
    initializeClientSignup() {
        this.loadPlansForSignup();
        this.setupSignupForm();
        this.handlePlanIdFromURL();
    }

    handlePlanIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const planId = urlParams.get('planId');
        if (planId) {
            const plan = this.vetPlans.find(p => p.id === planId);
            if (plan) {
                this.preselectPlan(plan);
            }
        }
    }

    preselectPlan(plan) {
        const planCard = document.querySelector(`[data-plan-id="${plan.id}"]`);
        if (planCard) {
            planCard.classList.add('ring-2', 'ring-blue-500');
            planCard.scrollIntoView({ behavior: 'smooth' });
        }
    }

    loadPlansForSignup() {
        const container = document.getElementById('plan-selection');
        if (!container) return;
        
        container.innerHTML = this.vetPlans.map(plan => `
            <div class="plan-card bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-200" data-plan-id="${plan.id}">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-bold text-gray-800">${plan.name}</h3>
                    <span class="text-2xl font-bold text-blue-600">$${plan.price}/month</span>
                </div>
                <p class="text-gray-600 mb-4">${plan.description}</p>
                <div class="space-y-2">
                    ${plan.services.map(service => `
                        <div class="flex items-center text-sm text-gray-600">
                            <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                            </svg>
                            ${service}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
        // Add click handlers
        document.querySelectorAll('.plan-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('ring-2', 'ring-blue-500'));
                card.classList.add('ring-2', 'ring-blue-500');
                this.selectedPlan = card.dataset.planId;
            });
        });
    }

    setupSignupForm() {
        const form = document.getElementById('signup-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }
    }

    handleSignup() {
        const formData = new FormData(document.getElementById('signup-form'));
        const signupData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            petName: formData.get('petName'),
            petType: formData.get('petType'),
            petAge: formData.get('petAge'),
            planId: this.selectedPlan
        };
        
        if (!signupData.planId) {
            this.showNotification('Please select a membership plan', 'error');
            return;
        }
        
        // Simulate successful signup
        this.showNotification('Account created successfully! Redirecting to dashboard...', 'success');
        setTimeout(() => {
            window.location.href = 'client-dashboard.html';
        }, 2000);
    }

    // Client Dashboard Functions
    initializeClientDashboard() {
        this.renderClientInfo();
        this.renderPetInfo();
        this.renderMembershipDetails();
    }

    renderClientInfo() {
        const container = document.getElementById('client-info');
        if (!container) return;
        
        // Mock client data
        const clientData = {
            name: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            memberSince: 'January 2024'
        };
        
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center mb-4">
                    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span class="text-blue-600 font-bold text-2xl">${clientData.name.charAt(0)}</span>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800">${clientData.name}</h2>
                        <p class="text-gray-600">${clientData.email}</p>
                    </div>
                </div>
                <div class="text-sm text-gray-500">
                    Member since ${clientData.memberSince}
                </div>
            </div>
        `;
    }

    renderPetInfo() {
        const container = document.getElementById('pet-info');
        if (!container) return;
        
        const pets = [
            { name: 'Max', type: 'Golden Retriever', age: '3 years', image: 'dog1.jpg' },
            { name: 'Luna', type: 'Domestic Cat', age: '2 years', image: 'cat1.jpg' }
        ];
        
        container.innerHTML = pets.map(pet => `
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center mb-4">
                    <div class="w-16 h-16 bg-gray-200 rounded-full mr-4 flex items-center justify-center">
                        <span class="text-2xl">${pet.type.includes('Dog') ? '🐕' : '🐱'}</span>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">${pet.name}</h3>
                        <p class="text-gray-600">${pet.type} • ${pet.age}</p>
                    </div>
                </div>
                <button class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Schedule Appointment
                </button>
            </div>
        `).join('');
    }

    renderMembershipDetails() {
        const container = document.getElementById('membership-details');
        if (!container) return;
        
        const membership = {
            plan: 'Premium Wellness',
            price: 89,
            nextBilling: 'December 15, 2024',
            services: ['Annual Exam', 'Vaccinations', 'Dental Cleaning', 'Blood Work', 'Unlimited Consultations']
        };
        
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4">Your Membership</h3>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Plan:</span>
                        <span class="font-medium">${membership.plan}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Monthly Cost:</span>
                        <span class="font-medium">$${membership.price}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Next Billing:</span>
                        <span class="font-medium">${membership.nextBilling}</span>
                    </div>
                </div>
                <div class="mt-6">
                    <h4 class="font-medium text-gray-800 mb-3">Included Services:</h4>
                    <div class="space-y-2">
                        ${membership.services.map(service => `
                            <div class="flex items-center text-sm text-gray-600">
                                <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                </svg>
                                ${service}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Utility Functions
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    saveDemoData() {
        const data = {
            vetPlans: this.vetPlans,
            clients: this.clients
        };
        localStorage.setItem('pawplan_demo_data', JSON.stringify(data));
    }

    setupEventListeners() {
        // Demo mode toggle
        const demoToggle = document.getElementById('demo-toggle');
        if (demoToggle) {
            demoToggle.addEventListener('click', () => this.toggleDemoMode());
        }
    }

    initializeCurrentPage() {
        const path = window.location.pathname;
        
        if (path.includes('vet-dashboard.html')) {
            this.initializeVetDashboard();
        } else if (path.includes('client-signup.html')) {
            this.initializeClientSignup();
        } else if (path.includes('client-dashboard.html')) {
            this.initializeClientDashboard();
        }
    }
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PawPlanApp();
});