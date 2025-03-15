# img-gadget-api

### Description

The imf-gadget-api is a RESTful web service implementation built using Node.JS framework. This project was developed as a technical assessment task for Upraised (https://www.upraised.co/), a career acceleration platform. The API demonstrates the ability to create scalable web services following REST architectural principles and modern development practices in TypeScipt/Node.JS environment.


### Features
- CRUD functionality for `Gadget`
- Filter gadgets by status
- Decommission or self-destruct gadgets
- OpenAPI support


### Installation
Clone the repository:
```bash
git clone https://github.com/akumarujon/imf-gadget-api
```
```bash
cd imf-gadget-api
```

Install the dependencies:
```bash
pnpm i
```

Run the project
```bash
pnpm run dev
```

### API Endpoints
- GET /gadgets - List all gadgets
- POST /gadgets - Create a new gadget
- GET /gadgets/{id} - Get a specific gadget
- PATCH /gadgets/{id} - Update a gadget
- DELETE /gadgets/{id} - Decommission a gadget
- POST /gadgets/{id}/self-destruct - Delete a gadget permanently

### Tech Stack
- [Node.JS](https://nodejs.org/en) / [Bun](https://bun.sh)
- [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [DrizzleORM](https://orm.drizzle.team/)

### License

The project is licensed under MIT and can be found in [LICENSE](./LICENSE) file