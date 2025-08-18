const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('script.js behaviours', () => {
  let window, document, observerCallback;

  beforeEach(() => {
    // Basic HTML structure
    const html = `<!DOCTYPE html><body>
      <div class="section" id="sec"></div>
      <button id="back-to-top"></button>
    </body>`;
    const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
    window = dom.window;
    document = window.document;

    // Mock IntersectionObserver
    window.IntersectionObserver = jest.fn(cb => {
      observerCallback = cb;
      return { observe: jest.fn() };
    });

    // Load script.js into the DOM
    const scriptText = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptText;
    document.body.appendChild(scriptEl);
  });

  afterEach(() => {
    window.close();
  });

  test('IntersectionObserver adds visible class', () => {
    const section = document.getElementById('sec');
    // simulate intersection
    observerCallback([{ isIntersecting: true, target: section }]);
    expect(section.classList.contains('visible')).toBe(true);
  });

  test('back-to-top button visibility on scroll', () => {
    const btn = document.getElementById('back-to-top');

    window.scrollY = 400;
    window.dispatchEvent(new window.Event('scroll'));
    expect(btn.style.display).toBe('block');

    window.scrollY = 0;
    window.dispatchEvent(new window.Event('scroll'));
    expect(btn.style.display).toBe('none');
  });
});
