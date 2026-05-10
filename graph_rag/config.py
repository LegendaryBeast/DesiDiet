"""
Neo4j connection configuration.
Supports both Docker (local) and AuraDB (cloud).
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ──────────────────────────────────────────────
# Toggle: 'docker' or 'cloud'
# ──────────────────────────────────────────────
NEO4J_MODE = os.getenv('NEO4J_MODE', 'docker')

# Docker (local) settings
DOCKER_URI = os.getenv('NEO4J_DOCKER_URI', 'bolt://localhost:7687')
DOCKER_USER = os.getenv('NEO4J_DOCKER_USER', 'neo4j')
DOCKER_PASSWORD = os.getenv('NEO4J_DOCKER_PASSWORD', 'khadok2025')

# AuraDB (cloud) settings
CLOUD_URI = os.getenv('NEO4J_CLOUD_URI', '')       # neo4j+s://xxxx.databases.neo4j.io
CLOUD_USER = os.getenv('NEO4J_CLOUD_USER', 'neo4j')
CLOUD_PASSWORD = os.getenv('NEO4J_CLOUD_PASSWORD', '')


def get_neo4j_config() -> dict:
    """Return the active Neo4j connection config based on NEO4J_MODE."""
    if NEO4J_MODE == 'cloud':
        if not CLOUD_URI or not CLOUD_PASSWORD:
            raise ValueError(
                "Cloud mode selected but NEO4J_CLOUD_URI or NEO4J_CLOUD_PASSWORD not set. "
                "Check your .env file."
            )
        return {
            'uri': CLOUD_URI,
            'user': CLOUD_USER,
            'password': CLOUD_PASSWORD,
        }
    else:
        return {
            'uri': DOCKER_URI,
            'user': DOCKER_USER,
            'password': DOCKER_PASSWORD,
        }
