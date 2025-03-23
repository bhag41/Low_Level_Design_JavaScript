class PackageManager {
    constructor() {
        this.installedPackages = new Map(); // Stores installed packages (name -> version)
    }

    install(packageName, version, dependencies = []) {
        if (this.installedPackages.has(packageName)) {
            const installedVersion = this.installedPackages.get(packageName);
            if (installedVersion === version) {
                console.log(`${packageName}@${version} is already installed.`);
                return;
            } else {
                console.log(`${packageName}@${version} is already installed, but version ${installedVersion} is present.`);
                // In a more complete system, you'd handle version conflicts here.
                return;
            }
        }

        const packageGraph = new Map();
        const visited = new Set();
        const installOrder = [];

        // Build the dependency graph
        const buildGraph = (pkgName, pkgVersion, deps) => {
            if (!packageGraph.has(pkgName)) {
                packageGraph.set(pkgName, { version: pkgVersion, dependencies: deps });
            }
            deps.forEach(dep => {
                if (!packageGraph.has(dep.name)) {
                    buildGraph(dep.name, dep.version, []); // Assuming no nested dependencies for now in this scope
                }
            });
        };

        buildGraph(packageName, version, dependencies);

        // Topological Sort (DFS) for installation order
        const dfs = (pkgName, stack) => {
            if (stack.has(pkgName)) throw new Error(`Circular dependency detected at ${pkgName}!`);

            if (!visited.has(pkgName)) {
                stack.add(pkgName);
                const pkg = packageGraph.get(pkgName);
                if (pkg) {
                    pkg.dependencies.forEach(dep => {
                        // Basic check: If a dependency is already installed with a *different* version, we'll note it.
                        if (this.installedPackages.has(dep.name) && this.installedPackages.get(dep.name) !== dep.version) {
                            console.warn(`Warning: ${packageName} requires ${dep.name}@${dep.version}, but ${dep.name}@${this.installedPackages.get(dep.name)} is already installed.`);
                        }
                        dfs(dep.name, stack);
                    });
                }
                visited.add(pkgName);
                installOrder.push(pkgName); // Add to the order after visiting all dependencies
                stack.delete(pkgName);
            }
        };

        try {
            dfs(packageName, new Set());
        } catch (error) {
            console.error(error.message);
            return;
        }

        // Install in the correct order (dependencies first)
        const sortedInstallOrder = installOrder.reverse(); // Reverse to get dependencies first
        for (const pkgName of sortedInstallOrder) {
            const pkg = packageGraph.get(pkgName);
            if (!this.installedPackages.has(pkgName)) {
                this.installPackage(pkgName, pkg.version);
            } else {
                // If already installed (and not the target package), we've already checked the version above.
                // This scenario might happen if a dependency is also a dependency of another package being installed.
                if (pkgName !== packageName) {
                    const installedVersion = this.installedPackages.get(pkgName);
                    if (installedVersion !== pkg.version) {
                        console.warn(`Warning: Dependency ${pkgName} is already installed with version ${installedVersion}, but ${packageName} requires version ${pkg.version}.`);
                    }
                }
            }
        }
    }

    installPackage(name, version) {
        if (!this.installedPackages.has(name)) {
            this.installedPackages.set(name, version);
            console.log(`Installed ${name}@${version}`);
        }
    }
}

// Usage
const packageManager = new PackageManager();
packageManager.install("A", "1.0", [
    { name: "B", version: "1.1" },
    { name: "C", version: "2.0" }
]);

packageManager.install("B", "1.1", [
    { name: "D", version: "3.2" }
]);

packageManager.install("C", "2.0", [
    { name: "D", version: "3.2" }
]);

packageManager.install("D", "3.2", []);

packageManager.install("A", "1.0", []); // Should say already installed
packageManager.install("A", "1.1", [{ name: "B", version: "1.1" }]); // Should warn about existing version
packageManager.install("B", "1.2", [{ name: "D", version: "3.2" }]); // Should warn about existing version of D