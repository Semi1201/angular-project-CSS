const jsonServer = require("json-server");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);

server.use(jsonServer.bodyParser);

server.use((req, res, next) => {
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    next();
});

server.use((req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader !== "Bearer admin123") {
        return res.status(401).json({
            message: "Unauthorized - Missing or invalid token"
        });
    }

    next();
});

server.use(router);

server.listen(3000, () => {
    console.log("JSON Server running on http://localhost:3000");
});
