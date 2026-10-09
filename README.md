# Crowns and Auras

> A modern perfume retail e-commerce website designed to make discovering and ordering fragrances simple.

![Project Status](https://img.shields.io/badge/Status-In%20Development-orange)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-Enabled-06B6D4?logo=tailwindcss)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)

## Overview

**Crowns and Auras** is a perfume retail business project focused on building a functional, responsive online storefront where customers can discover fragrances, explore product details and prices, and place orders conveniently.

The application is being developed as a real-world client project, with a focus on translating business requirements into a practical, maintainable software solution.

The initial goal is to deliver a focused **Minimum Viable Product (MVP)** with a customer-facing storefront and a simple administrative dashboard for managing products and orders.

> **Current status:** Initial project setup completed. Feature development, database integration and visual design are pending.

## Project Objectives

* Create a professional online presence for Crowns and Auras.
* Display perfumes with product information, prices, images and availability.
* Provide a simple shopping cart and guest checkout experience.
* Allow customers to submit orders without creating accounts.
* Provide an administrative dashboard for product and order management.
* Deliver a mobile-first, accessible and responsive experience.
* Build a maintainable foundation that can support future business requirements.

## Planned Features

### Customer Storefront

* Homepage with featured products and business information.
* Product catalogue.
* Product detail pages.
* Product search and filtering, where appropriate.
* Shopping cart.
* Guest checkout.
* Order submission and confirmation.
* Responsive layouts for mobile, tablet and desktop.

### Administrative Dashboard

* Secure administrator authentication.
* View and manage products.
* Add, edit and remove products.
* View incoming orders and order details.
* Update order statuses.

### Potential Future Enhancements

Features will be considered based on confirmed business needs:

* Online payments through a suitable payment provider.
* Customer reviews.
* Improved inventory management.
* Additional product filtering and sorting.

Customer accounts, loyalty programmes, AI recommendations, advanced analytics and complex delivery tracking are outside the initial scope unless later requirements justify them.

## Technology Stack

| Technology                                    | Purpose                                |
| --------------------------------------------- | -------------------------------------- |
| [Next.js](https://nextjs.org/)                | Full-stack React framework             |
| [React](https://react.dev/)                   | User interface                         |
| [TypeScript](https://www.typescriptlang.org/) | Static type checking                   |
| [Tailwind CSS](https://tailwindcss.com/)      | Styling and responsive layouts         |
| [ESLint](https://eslint.org/)                 | Code quality and linting               |
| [MongoDB](https://www.mongodb.com/)           | Planned database                       |
| [Mongoose](https://mongoosejs.com/)           | Object Data Modeling (ODM) for MongoDB |
| [Zod](https://zod.dev/)                       | Runtime data validation                |
| [Git](https://git-scm.com/)                   | Version control                        |
| [GitHub](https://github.com/)                 | Source code hosting and collaboration  |
| [Vercel](https://vercel.com/)                 | Potential deployment platform          |

The application uses the Next.js App Router, TypeScript and a `src/` directory. The final architecture and deployment choices will be reviewed against the confirmed requirements.

## Project Requirements

The following business details remain subject to confirmation:

* Final branding, logo, colours, typography and visual direction.
* Product catalogue, brands, sizes, descriptions, images and prices.
* Inventory tracking requirements.
* Product sourcing and fulfilment process.
* Delivery locations, fees and policies.
* Payment methods and order confirmation process.
* Customer communication channels.
* Whether customer reviews are needed at launch.

Sample products and placeholder content will be clearly identified until the business owner supplies the actual catalogue.

## Getting Started

### Prerequisites

Install a compatible version of [Node.js](https://nodejs.org/) and npm.

Verify your installation:

```bash
node -v
npm -v
```

### Installation

Clone the repository after it has been published to GitHub:

```bash
git clone <repository-url>
cd crowns-and-auras
```

If you already have the project locally, open your terminal in the project directory instead.

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root when local environment variables are required.

Example configuration:

```env
MONGODB_URI=your_mongodb_connection_string
```

This is a placeholder, not a working database connection. MongoDB integration must be configured before database-backed features can function.

**Security requirements:**

* Never commit `.env.local` or real credentials.
* Never expose private API keys or database credentials in client-side code.
* Do not use the `NEXT_PUBLIC_` prefix for secrets.
* Configure production environment variables through the deployment platform.

### Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Available Scripts

| Command         | Description                                      |
| --------------- | ------------------------------------------------ |
| `npm run dev`   | Start the development server                     |
| `npm run build` | Build the application for production             |
| `npm run start` | Start the production server                      |
| `npm run lint`  | Run lint checks, if configured in `package.json` |

## Project Structure

The following represents the intended structure as the project grows. Not every directory or feature exists yet.

```text
crowns-and-auras/
├── public/                 # Static assets
├── src/
│   └── app/                # Pages, layouts and route handlers
├── .env.local              # Local environment variables
├── .gitignore              # Files excluded from Git
├── package.json            # Dependencies and scripts
├── package-lock.json       # Locked dependency versions
├── tsconfig.json           # TypeScript configuration
├── eslint.config.mjs       # ESLint configuration
└── README.md               # Project documentation
```

Additional directories for reusable components, database models, validation schemas and server-side utilities will be introduced when needed.

## Development Workflow

Development will follow a structured process:

1. **Discovery** — understand the business, customers and existing sales process.
2. **Requirements** — define business needs and the initial MVP scope.
3. **Design** — confirm the preferred visual direction and user experience.
4. **Architecture** — establish application structure and data models.
5. **Implementation** — develop features incrementally.
6. **Testing** — validate functionality, security, accessibility and responsiveness.
7. **Deployment** — configure production services and publish the application.
8. **Handover** — document basic administration and operational procedures.

The project prioritises functionality, usability, security and maintainability over unnecessary complexity.

## Security Considerations

* Validate untrusted input on the server before processing it.
* Never trust product prices, order totals or payment status supplied by the browser.
* Protect administrative pages and server operations with authentication and authorization.
* Keep credentials and API secrets out of source control.
* Verify payments server-side if an online payment provider is introduced.
* Review dependency vulnerabilities and apply appropriate updates.
* Handle invalid input, failed requests and unavailable services safely.

## Documentation

* [Next.js Documentation](https://nextjs.org/docs)
* [React Documentation](https://react.dev/learn)
* [TypeScript Documentation](https://www.typescriptlang.org/docs/)
* [Tailwind CSS Documentation](https://tailwindcss.com/docs)
* [MongoDB Documentation](https://www.mongodb.com/docs/)
* [Mongoose Documentation](https://mongoosejs.com/docs/)
* [Zod Documentation](https://zod.dev/)
* [Git Documentation](https://git-scm.com/doc)

## GitHub Topics

Suggested repository topics:

`nextjs` `react` `typescript` `tailwindcss` `mongodb` `mongoose` `zod` `ecommerce` `perfume-store`

Add these through the repository's **About → Topics** settings after publishing to GitHub.

## License

No license has been selected yet. A license should be added once the project owner has decided the terms under which the source code may be used, modified and distributed.

---

**Crowns and Auras** — built with a focus on practical business needs, thoughtful engineering and a straightforward customer experience.
