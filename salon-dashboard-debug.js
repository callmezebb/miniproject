document.addEventListener('DOMContentLoaded', function() {
    console.log('Salon Dashboard Loading...');
    
    // Get authentication data from localStorage
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    const salonId = localStorage.getItem('salonId');
    
    // Log auth data (without exposing the actual token)
    console.log('Auth Check:', {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        userType: userType,
        salonId: salonId
    });
    
    // Stay on the dashboard page regardless of auth status - for debugging only
    // Comment out any redirects to login page
    
    // Add debugging helpers to the page
    const debugDiv = document.createElement('div');
    debugDiv.style.position = 'fixed';
    debugDiv.style.bottom = '10px';
    debugDiv.style.right = '10px';
    debugDiv.style.backgroundColor = '#f8f9fa';
    debugDiv.style.padding = '10px';
    debugDiv.style.border = '1px solid #ddd';
    debugDiv.style.borderRadius = '5px';
    debugDiv.style.zIndex = '9999';
    
    debugDiv.innerHTML = `
        <h4>Auth Debug Info</h4>
        <p>Has Token: ${!!token}</p>
        <p>User Type: ${userType || 'Not set'}</p>
        <p>Salon ID: ${salonId || 'Not set'}</p>
        <button id="fixAuthBtn">Fix Auth Data</button>
        <button id="clearAuthBtn">Clear Auth Data</button>
    `;
    
    document.body.appendChild(debugDiv);
    
    // Add event listeners to debug buttons
    document.getElementById('fixAuthBtn').addEventListener('click', function() {
        // This would normally be set after successful login
        const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJ1c2VyVHlwZSI6InNhbG9uIiwiaWF0IjoxNjE0OTg3NjU0fQ.KPQpLT9-f6z8HnfdO2kJRFUkOQYx7MKU5wy1Y2HL9uk';
        const dummySalonId = '123456789';
        
        localStorage.setItem('token', dummyToken);
        localStorage.setItem('userType', 'salon');
        localStorage.setItem('salonId', dummySalonId);
        localStorage.setItem('salonName', 'Test Salon');
        
        alert('Auth data fixed for debugging (dummy data). Refresh the page to see changes.');
        location.reload();
    });
    
    document.getElementById('clearAuthBtn').addEventListener('click', function() {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('salonId');
        localStorage.removeItem('salonName');
        
        alert('Auth data cleared. Refresh the page to see changes.');
        location.reload();
    });
}); 