/**
 * VitePress 风格主题 JavaScript
 * 提供交互功能：菜单切换、搜索、目录高亮、平滑滚动等
 */

(function() {
    'use strict';

    // ========== 全局变量 ==========
    var sidebar = null;
    var menuToggle = null;
    var sidebarBackdrop = null;

    // ========== 初始化 ==========
    function init() {
        initElements();
        bindEvents();
        initSearch();
        initTocHighlight();
        initSmoothScroll();
        initKeyboardShortcuts();
    }

    // ========== 初始化 DOM 元素引用 ==========
    function initElements() {
        sidebar = document.getElementById('vp-sidebar');
        menuToggle = document.querySelector('.vp-menu-toggle');
        if (sidebar) {
            sidebarBackdrop = sidebar.querySelector('.vp-sidebar-backdrop');
        }
    }

    // ========== 绑定事件 ==========
    function bindEvents() {
        // 移动端菜单切换
        if (menuToggle) {
            menuToggle.addEventListener('click', toggleMenu);
        }

        // 点击背景关闭侧边栏
        if (sidebarBackdrop) {
            sidebarBackdrop.addEventListener('click', closeMenu);
        }

        // 窗口大小改变时处理
        window.addEventListener('resize', debounce(function() {
            if (window.innerWidth > 960) {
                closeMenu();
            }
        }, 100));

        // 键盘事件
        document.addEventListener('keydown', handleKeydown);
    }

    // ========== 切换菜单 ==========
    function toggleMenu() {
        if (!sidebar) return;

        if (sidebar.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    // ========== 打开菜单 ==========
    function openMenu() {
        if (!sidebar) return;

        sidebar.classList.add('open');
        document.body.style.overflow = 'hidden';

        // 添加动画效果
        if (menuToggle) {
            menuToggle.classList.add('active');
        }
    }

    // ========== 关闭菜单 ==========
    function closeMenu() {
        if (!sidebar) return;

        sidebar.classList.remove('open');
        document.body.style.overflow = '';

        if (menuToggle) {
            menuToggle.classList.remove('active');
        }
    }

    // ========== 检查菜单是否打开 ==========
    function isMenuOpen() {
        return sidebar && sidebar.classList.contains('open');
    }

    // ========== 键盘快捷键 ==========
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl+K 或 Cmd+K 聚焦搜索框
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                focusSearch();
            }
        });
    }

    function handleKeydown(e) {
        // ESC 键关闭菜单
        if (e.key === 'Escape') {
            if (isMenuOpen()) {
                closeMenu();
            }
        }
    }

    // ========== 聚焦搜索框 ==========
    function focusSearch() {
        var searchInput = document.querySelector('#book-search-input input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    // ========== 初始化搜索功能 ==========
    function initSearch() {
        var searchInput = document.querySelector('#book-search-input input');
        if (!searchInput) return;

        // 防抖搜索
        var debounceTimer;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function() {
                performSearch(e.target.value);
            }, 300);
        });

        // 回车搜索
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                clearTimeout(debounceTimer);
                performSearch(e.target.value);
            }
        });
    }

    // ========== 执行搜索 ==========
    function performSearch(query) {
        if (!query || query.trim() === '') {
            showSearchResults(false);
            return;
        }

        // 如果有内置的搜索功能，使用它
        if (typeof window.Search !== 'undefined') {
            window.Search.query(query);
            showSearchResults(true);
        }
    }

    // ========== 显示/隐藏搜索结果 ==========
    function showSearchResults(show) {
        var searchResults = document.getElementById('book-search-results');

        if (!searchResults) return;

        if (show) {
            searchResults.classList.add('open');
            document.body.style.overflow = 'hidden';
        } else {
            searchResults.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    // ========== 初始化目录高亮 ==========
    function initTocHighlight() {
        var outlineLinks = document.querySelectorAll('.vp-outline-link');
        if (outlineLinks.length === 0) return;

        var headings = [];
        outlineLinks.forEach(function(link) {
            var targetId = link.getAttribute('href');
            if (!targetId || targetId === '#') return;

            var targetElement = document.querySelector(targetId);
            if (targetElement) {
                headings.push({
                    link: link,
                    element: targetElement,
                    top: 0
                });
            }
        });

        if (headings.length === 0) return;

        // 滚动时高亮当前目录项
        var ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    highlightCurrentTocItem(headings);
                    ticking = false;
                });
                ticking = true;
            }
        });

        // 初始高亮
        highlightCurrentTocItem(headings);
    }

    // ========== 高亮当前目录项 ==========
    function highlightCurrentTocItem(headings) {
        var scrollPos = window.scrollY + 100;
        var activeIndex = -1;

        headings.forEach(function(heading, index) {
            var elementTop = heading.element.offsetTop;
            var elementBottom = elementTop + heading.element.offsetHeight;

            if (scrollPos >= elementTop && scrollPos < elementBottom) {
                activeIndex = index;
            }

            // 重置样式
            heading.link.classList.remove('active');
        });

        // 如果没有找到精确匹配，找最近的上方标题
        if (activeIndex === -1) {
            for (var i = headings.length - 1; i >= 0; i--) {
                if (scrollPos >= headings[i].element.offsetTop) {
                    activeIndex = i;
                    break;
                }
            }
        }

        // 高亮当前项
        if (activeIndex >= 0 && headings[activeIndex]) {
            headings[activeIndex].link.classList.add('active');
        }
    }

    // ========== 初始化平滑滚动 ==========
    function initSmoothScroll() {
        var links = document.querySelectorAll('a[href^="#"]');
        links.forEach(function(link) {
            link.addEventListener('click', function(e) {
                var targetId = this.getAttribute('href');
                if (targetId === '#' || targetId === '') return;

                var targetElement = document.querySelector(targetId);
                if (!targetElement) return;

                e.preventDefault();
                smoothScrollTo(targetElement, 500);

                // 更新 URL（不跳转）
                if (history.pushState) {
                    history.pushState(null, null, targetId);
                }

                // 移动端：关闭菜单后滚动
                if (isMenuOpen()) {
                    closeMenu();
                }
            });
        });
    }

    // ========== 平滑滚动到元素 ==========
    function smoothScrollTo(element, duration) {
        var navHeight = 64; // 导航栏高度
        var targetPosition = element.offsetTop - navHeight - 20;
        var startPosition = window.scrollY;
        var distance = targetPosition - startPosition;
        var startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            var timeElapsed = currentTime - startTime;
            var run = easeInOutQuad(timeElapsed, startPosition, distance, duration);

            window.scrollTo(0, run);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    // ========== 缓动函数 ==========
    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    // ========== 防抖函数 ==========
    function debounce(func, wait) {
        var timeout;
        return function() {
            var context = this;
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }

    // ========== 节流函数 ==========
    function throttle(func, limit) {
        var inThrottle;
        return function() {
            var context = this;
            var args = arguments;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    // ========== 页面加载完成后初始化 ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ========== 导出公共方法（供其他脚本使用） ==========
    window.SmzhbookTheme = {
        toggleMenu: toggleMenu,
        openMenu: openMenu,
        closeMenu: closeMenu,
        isMenuOpen: isMenuOpen,
        focusSearch: focusSearch,
        smoothScrollTo: smoothScrollTo
    };

})();
