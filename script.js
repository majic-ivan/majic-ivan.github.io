const mobileMenu = document.getElementById('mobile-menu');
const navList = document.querySelector('.nav-list');

mobileMenu.addEventListener('click', () => {
    navList.classList.toggle('active');
});

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
});
document.addEventListener("DOMContentLoaded", function() {
    const user = "ivan.majic";
    const domain = "ucl.ac.uk";
    const email = user + "@" + domain;
    const emailLink = '<a href="mailto:' + email + '">' + email + '</a>';
    const emailElem = document.getElementById("email");
    if (emailElem) emailElem.innerHTML = emailLink;
});