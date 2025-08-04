.. _label-installation:

Installation
============
.. container:: justify-text

    These instructions will get you a copy of ``AMRnet`` up and running on your
    machine for development and testing purposes. AMRnet is a full-stack web application
    built with Node.js, React, and MongoDB.

Prerequisites
-------------
.. container:: justify-text

    Before installing AMRnet, make sure you have the following software installed:

    - **Node.js**: v18.20.4 or higher (specified in ``.nvmrc``)
    - **npm**: Latest version (comes with Node.js)
    - **Python**: v3.8+ (for data processing components)
    - **Git**: Latest version for version control
    - **MongoDB**: v6.0+ (local installation or MongoDB Atlas cloud database)

    You can check your installed versions with:

    .. code-block:: shell

        node --version
        npm --version
        python --version
        git --version

Quick Start
-----------
.. container:: justify-text

    Follow these steps to get AMRnet running locally:

    **1. Clone the Repository**

    .. code-block:: shell

        git clone https://github.com/amrnet/amrnet.git
        cd amrnet

    **2. Install Dependencies**

    .. code-block:: shell

        # Install backend dependencies
        npm install

        # Install frontend dependencies
        cd client && npm install && cd ..

    **3. Environment Configuration**

    .. code-block:: shell

        # Create environment file from template
        cp .env.example .env

        # Edit .env file with your configuration
        # Add your MongoDB connection string and other settings

    **4. Start Development Servers**

    .. code-block:: shell

        # Start both backend and frontend in development mode
        npm run start:dev

        # Or start them individually:
        npm run start:backend  # Backend only (port 8080)
        npm run client         # Frontend only (port 3000)

    **5. Access the Application**

    Open your browser and navigate to ``http://localhost:3000`` to see the AMRnet dashboard.

Development Setup
-----------------
.. container:: justify-text

    For detailed development setup, including code quality tools and best practices:

Node.js Version Management
~~~~~~~~~~~~~~~~~~~~~~~~~~
.. container:: justify-text

    AMRnet uses Node.js v18.20.4. If you use nvm (Node Version Manager):

    .. code-block:: shell

        # Use the project's specified Node.js version
        nvm use

        # Or install the specific version if not available
        nvm install v18.20.4
        nvm use v18.20.4

Python Dependencies
~~~~~~~~~~~~~~~~~~~
.. container:: justify-text

    For data processing components and documentation building:

    .. code-block:: shell

        # Install Python dependencies
        pip install -r requirements.txt

        # Install documentation dependencies
        pip install -r docs/requirements.txt

Environment Variables
~~~~~~~~~~~~~~~~~~~~~
.. container:: justify-text

    Configure your ``.env`` file with the following variables:

    .. code-block:: shell

        # Application settings
        NODE_ENV=development
        PORT=8080

        # Database configuration
        MONGODB_URI=mongodb://localhost:27017/amrnet
        # Or for MongoDB Atlas:
        # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/amrnet

        # Optional: Fixie proxy for Heroku deployment
        # FIXIE_URL=socks5://username:password@proxy-host:port

Production Build
----------------
.. container:: justify-text

    To build AMRnet for production deployment:

    .. code-block:: shell

        # Build the client application
        npm run build

        # Start the production server
        npm start

    The built application will be served from the ``client/build`` directory.

Docker Installation
-------------------
.. container:: justify-text

    AMRnet can also be run using Docker:

    .. code-block:: shell

        # Build the Docker image
        docker build -t amrnet .

        # Run the container
        docker run -p 8080:8080 -e MONGODB_URI=your_mongodb_uri amrnet

    Make sure to replace ``your_mongodb_uri`` with your actual MongoDB connection string.

Troubleshooting
---------------
.. container:: justify-text

    **Common Installation Issues:**

    1. **Node version mismatch**: Use ``nvm use`` to switch to the correct version
    2. **Package conflicts**: Delete ``node_modules`` and run ``npm install`` again
    3. **Port conflicts**: Make sure ports 3000 and 8080 are available
    4. **MongoDB connection**: Verify your MongoDB service is running or Atlas credentials are correct

    **Getting Help:**

    - Check the `Issue Tracker <https://github.com/amrnet/amrnet/issues>`_
    - Review the `Development Guide <../tutorial/development.md>`_
    - Join our `Discussions <https://github.com/amrnet/amrnet/discussions>`_
