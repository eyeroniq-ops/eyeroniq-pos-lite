module.exports = {
    apps: [{
        name: "pos",
        script: "npm",
        args: "start",
        cwd: "/home/eyeroniq/punto_de_venta",
        env: {
            NODE_ENV: "production",
            PORT: 3000
        }
    }]
}
