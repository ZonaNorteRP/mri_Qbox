const app = new Vue({
    el: "#app",
    data: {
        showMenu: false,
        driftPoints: 0,
        driftDisplay: "0",
        
        currentCategory: 'main',
        categories: [
            { id: 'main', label: 'Início', icon: 'fa-solid fa-house' }
        ],
        
        menuId: null,
        menuTitle: "",
        menuDescription: "",
        items: []
    },
    computed: {
        filteredItems() {
            return this.items;
        }
    },
    methods: {
        openMenu(data) {
            this.menuId = data.id;
            this.parentMenu = data.menu || null;
            // Clean markdown images from title
            this.menuTitle = (data.title || "MENU").replace(/!\[.*?\]\(.*?\)/g, '').trim();
            this.menuDescription = data.description || "";
            this.items = data.options || [];
            this.showMenu = true;
        },
        backMenu() {
            if (this.parentMenu) {
                fetch(`https://${GetParentResourceName()}/selectItem`, {
                    method: 'POST',
                    body: JSON.stringify({
                        menuId: this.menuId,
                        isBack: true,
                        parentMenu: this.parentMenu
                    })
                });
            }
        },
        closeMenu() {
            this.showMenu = false;
            fetch(`https://${GetParentResourceName()}/closeMenu`, {
                method: 'POST',
                body: JSON.stringify({})
            });
        },
        selectItem(item) {
            fetch(`https://${GetParentResourceName()}/selectItem`, {
                method: 'POST',
                body: JSON.stringify({
                    menuId: this.menuId,
                    itemIndex: this.items.indexOf(item) + 1 // Lua indices are 1-based
                })
            });
            
            // If it's a sub-menu (arrow: true), we usually wait for a new message
            // If it's a simple action, we might want to close the menu
            // ox_lib usually closes if not specified otherwise
            if (!item.arrow) {
                this.showMenu = false;
            }
        },
        getIcon(icon) {
            if (!icon) return 'fa-solid fa-circle';
            if (icon.startsWith('fa')) return icon;
            return `fa-solid fa-${icon}`;
        },
        formatDescription(desc) {
            if (!desc) return "";
            // Basic markdown-ish formatting for ox_lib style (BOLD **)
            return desc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                       .replace(/\n/g, '<br>');
        },
        updateDrift(points) {
            this.driftPoints = points;
            this.driftDisplay = points.toLocaleString();
        }
    },
    mounted() {
        console.log("NUI Tablet Mounted");
        window.addEventListener('message', (event) => {
            const data = event.data;
            console.log("NUI Message received:", JSON.stringify(data));
            
            if (data.action === "openMenu") {
                this.openMenu(data.data);
            } else if (data.action === "closeMenu") {
                this.showMenu = false;
            } else if (data.drift !== undefined) {
                this.updateDrift(data.drift);
            }
        });

        window.addEventListener('keyup', (event) => {
            if (event.key === 'Escape') {
                this.closeMenu();
            }
        });
    }
});