.. _label-gui:

====================
FARM Stack GUI Guide
====================

.. container:: justify-text

    AMRnet's next-generation interface is built with the FARM (FastAPI + React + MongoDB) stack, providing a modern, responsive, and highly interactive user experience for antimicrobial resistance data exploration and analysis.

.. .. contents:: Table of Contents
..    :local:
..    :depth: 2

Overview
========

.. container:: justify-text

    The FARM stack GUI represents a significant evolution of the AMRnet platform, offering:

    - **⚡ Performance**: 3x faster load times with server-side rendering
    - **🎨 Modern UI**: Material Design 3.0 with dark/light theme support
    - **📱 Responsive**: Mobile-first design that works on all devices
    - **🔄 Real-time**: Live data updates and collaborative features
    - **🌍 Accessibility**: WCAG 2.1 AA compliant interface
    - **🚀 Progressive**: Offline capabilities with service workers

Technology Stack
================

Frontend Architecture
---------------------

.. container:: justify-text

    The React frontend leverages modern development practices and cutting-edge libraries:

**Core Technologies:**

.. code-block:: typescript

    // package.json dependencies
    {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "typescript": "^5.0.0",
      "next": "^14.0.0",
      "tailwindcss": "^3.3.0"
    }

**Key Libraries:**

- **Next.js 14**: Server-side rendering and app router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations and transitions
- **React Query**: Server state management
- **Zustand**: Client state management
- **React Hook Form**: Form handling with validation
- **Recharts**: Advanced data visualizations
- **Mapbox GL**: Interactive geographic mapping

**Component Architecture:**

.. code-block:: typescript

    // src/components/organisms/DashboardLayout.tsx
    import React from 'react';
    import { Header } from '@/components/molecules/Header';
    import { Sidebar } from '@/components/molecules/Sidebar';
    import { MainContent } from '@/components/atoms/MainContent';

    interface DashboardLayoutProps {
      children: React.ReactNode;
      organism: string;
    }

    export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
      children,
      organism
    }) => {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header organism={organism} />
          <div className="flex">
            <Sidebar organism={organism} />
            <MainContent>{children}</MainContent>
          </div>
        </div>
      );
    };

Backend Infrastructure
----------------------

.. container:: justify-text

    The FastAPI backend provides high-performance APIs with automatic documentation:

**FastAPI Application:**

.. code-block:: python

    # src/backend/main.py
    from fastapi import FastAPI, WebSocket, BackgroundTasks
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.middleware.gzip import GZipMiddleware
    import uvicorn

    app = FastAPI(
        title="AMRnet FARM API",
        description="High-performance API for AMR surveillance data",
        version="2.1.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc"
    )

    # Middleware configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["https://farm.amrnet.org"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # API routers
    from .routers import organisms, analytics, auth, websockets

    app.include_router(organisms.router, prefix="/api/v2")
    app.include_router(analytics.router, prefix="/api/v2/analytics")
    app.include_router(auth.router, prefix="/api/v2/auth")
    app.include_router(websockets.router, prefix="/ws")

**MongoDB Integration:**

.. code-block:: python

    # src/backend/database.py
    from motor.motor_asyncio import AsyncIOMotorClient
    from typing import Optional
    import asyncio

    class Database:
        client: Optional[AsyncIOMotorClient] = None

    db = Database()

    async def get_database() -> AsyncIOMotorClient:
        return db.client

    async def connect_to_mongo():
        """Create database connection"""
        db.client = AsyncIOMotorClient(
            "mongodb+srv://cluster.mongodb.net",
            maxPoolSize=10,
            minPoolSize=1,
            serverSelectionTimeoutMS=5000
        )

    async def close_mongo_connection():
        """Close database connection"""
        db.client.close()

Key Features
============

Interactive Dashboard Components
--------------------------------

**Organism Selector:**

.. code-block:: typescript

    // src/components/molecules/OrganismSelector.tsx
    import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { useOrganismData } from '@/hooks/useOrganismData';

    interface Organism {
      id: string;
      name: string;
      description: string;
      sampleCount: number;
      icon: string;
    }

    export const OrganismSelector: React.FC = () => {
      const [selectedOrganism, setSelectedOrganism] = useState<string>('styphi');
      const { data: organisms, isLoading } = useOrganismData();

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {organisms?.map((organism: Organism) => (
            <motion.div
              key={organism.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                p-6 rounded-xl border-2 cursor-pointer transition-all
                ${selectedOrganism === organism.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                }
              `}
              onClick={() => setSelectedOrganism(organism.id)}
            >
              <div className="text-4xl mb-4">{organism.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{organism.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {organism.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {organism.sampleCount.toLocaleString()} samples
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  Explore →
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      );
    };

**Real-time Resistance Chart:**

.. code-block:: typescript

    // src/components/organisms/ResistanceChart.tsx
    import React, { useEffect, useState } from 'react';
    import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
    import { useWebSocket } from '@/hooks/useWebSocket';

    interface ResistanceData {
      year: number;
      month: number;
      resistance_rate: number;
      sample_count: number;
    }

    export const ResistanceChart: React.FC<{
      organism: string;
      antibiotic: string;
      country?: string;
    }> = ({ organism, antibiotic, country }) => {
      const [data, setData] = useState<ResistanceData[]>([]);

      // WebSocket connection for real-time updates
      const { lastMessage, connectionStatus } = useWebSocket(
        `wss://farm-api.amrnet.org/ws/${organism}/resistance/${antibiotic}`,
        {
          shouldReconnect: () => true,
          reconnectAttempts: 10,
          reconnectInterval: 3000,
        }
      );

      useEffect(() => {
        if (lastMessage?.data) {
          const newData = JSON.parse(lastMessage.data);
          setData(prevData => [...prevData.slice(-50), newData]); // Keep last 50 points
        }
      }, [lastMessage]);

      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">
              {antibiotic} Resistance Trends
            </h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'Open' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-gray-500">
                {connectionStatus === 'Open' ? 'Live' : 'Disconnected'}
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
              <XAxis
                dataKey="year"
                className="dark:text-gray-300"
              />
              <YAxis
                domain={[0, 1]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                className="dark:text-gray-300"
              />
              <Tooltip
                labelFormatter={(year) => `Year: ${year}`}
                formatter={(value: number, name) => [
                  `${(value * 100).toFixed(1)}%`,
                  'Resistance Rate'
                ]}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="resistance_rate"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    };

**Interactive Geographic Map:**

.. code-block:: typescript

    // src/components/organisms/GeographicMap.tsx
    import React, { useRef, useEffect, useState } from 'react';
    import mapboxgl from 'mapbox-gl';
    import { useQuery } from '@tanstack/react-query';
    import { getGeographicData } from '@/api/organisms';

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    export const GeographicMap: React.FC<{
      organism: string;
      metric: 'resistance_rate' | 'sample_count';
    }> = ({ organism, metric }) => {
      const mapContainer = useRef<HTMLDivElement>(null);
      const map = useRef<mapboxgl.Map | null>(null);
      const [mapLoaded, setMapLoaded] = useState(false);

      const { data: geoData } = useQuery({
        queryKey: ['geographic', organism, metric],
        queryFn: () => getGeographicData(organism, metric),
        refetchInterval: 60000, // Refresh every minute
      });

      useEffect(() => {
        if (map.current || !mapContainer.current) return;

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [0, 20],
          zoom: 2,
          projection: 'naturalEarth'
        });

        map.current.on('load', () => {
          setMapLoaded(true);
        });

        return () => map.current?.remove();
      }, []);

      useEffect(() => {
        if (!mapLoaded || !geoData || !map.current) return;

        // Add choropleth layer
        if (map.current.getSource('countries')) {
          map.current.removeLayer('countries-fill');
          map.current.removeSource('countries');
        }

        map.current.addSource('countries', {
          type: 'geojson',
          data: geoData
        });

        map.current.addLayer({
          id: 'countries-fill',
          type: 'fill',
          source: 'countries',
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', metric],
              0, '#eff6ff',
              0.25, '#bfdbfe',
              0.5, '#60a5fa',
              0.75, '#2563eb',
              1, '#1d4ed8'
            ],
            'fill-opacity': 0.8
          }
        });

        // Add hover effects
        map.current.on('mouseenter', 'countries-fill', (e) => {
          map.current!.getCanvas().style.cursor = 'pointer';
        });

        map.current.on('mouseleave', 'countries-fill', () => {
          map.current!.getCanvas().style.cursor = '';
        });
      }, [mapLoaded, geoData, metric]);

      return (
        <div className="relative w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
          <div ref={mapContainer} className="w-full h-full" />
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          )}
        </div>
      );
    };

Advanced Analytics Interface
----------------------------

**Statistical Analysis Dashboard:**

.. code-block:: typescript

    // src/components/pages/AnalyticsDashboard.tsx
    import React, { useState } from 'react';
    import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
    import { RegressionAnalysis } from '@/components/organisms/RegressionAnalysis';
    import { ClusterAnalysis } from '@/components/organisms/ClusterAnalysis';
    import { MLPredictions } from '@/components/organisms/MLPredictions';
    import { StatisticalTests } from '@/components/organisms/StatisticalTests';

    export const AnalyticsDashboard: React.FC<{ organism: string }> = ({
      organism
    }) => {
      const [selectedFilters, setSelectedFilters] = useState({
        countries: [] as string[],
        yearRange: [2010, 2023] as [number, number],
        antibiotics: [] as string[],
      });

      return (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h1 className="text-2xl font-bold mb-6">
              Advanced Analytics - {organism.toUpperCase()}
            </h1>

            <Tabs selectedTabClassName="bg-blue-600 text-white">
              <TabList className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
                <Tab className="w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 cursor-pointer">
                  Regression Analysis
                </Tab>
                <Tab className="w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 cursor-pointer">
                  Clustering
                </Tab>
                <Tab className="w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 cursor-pointer">
                  ML Predictions
                </Tab>
                <Tab className="w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 cursor-pointer">
                  Statistical Tests
                </Tab>
              </TabList>

              <TabPanel className="mt-6">
                <RegressionAnalysis
                  organism={organism}
                  filters={selectedFilters}
                />
              </TabPanel>

              <TabPanel className="mt-6">
                <ClusterAnalysis
                  organism={organism}
                  filters={selectedFilters}
                />
              </TabPanel>

              <TabPanel className="mt-6">
                <MLPredictions
                  organism={organism}
                  filters={selectedFilters}
                />
              </TabPanel>

              <TabPanel className="mt-6">
                <StatisticalTests
                  organism={organism}
                  filters={selectedFilters}
                />
              </TabPanel>
            </Tabs>
          </div>
        </div>
      );
    };

**API Explorer Interface:**

.. code-block:: typescript

    // src/components/pages/APIExplorer.tsx
    import React, { useState } from 'react';
    import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
    import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
    import { useMutation } from '@tanstack/react-query';

    export const APIExplorer: React.FC = () => {
      const [endpoint, setEndpoint] = useState('/api/v2/styphi');
      const [method, setMethod] = useState('GET');
      const [headers, setHeaders] = useState('{"Content-Type": "application/json"}');
      const [params, setParams] = useState('{"limit": 100}');
      const [response, setResponse] = useState<any>(null);

      const makeRequest = useMutation({
        mutationFn: async () => {
          const url = new URL(`https://farm-api.amrnet.org${endpoint}`);

          if (method === 'GET' && params) {
            const parsedParams = JSON.parse(params);
            Object.entries(parsedParams).forEach(([key, value]) => {
              url.searchParams.append(key, String(value));
            });
          }

          const response = await fetch(url.toString(), {
            method,
            headers: JSON.parse(headers),
            body: method !== 'GET' ? params : undefined,
          });

          return response.json();
        },
        onSuccess: (data) => setResponse(data),
      });

      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-screen">
          {/* Request Configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-6">API Request Builder</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Endpoint</label>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                  placeholder="/api/v2/styphi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Headers</label>
                <textarea
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 h-20"
                  placeholder='{"Content-Type": "application/json"}'
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {method === 'GET' ? 'Query Parameters' : 'Request Body'}
                </label>
                <textarea
                  value={params}
                  onChange={(e) => setParams(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 h-32"
                  placeholder={method === 'GET' ? '{"limit": 100}' : '{"country": "BGD"}'}
                />
              </div>

              <button
                onClick={() => makeRequest.mutate()}
                disabled={makeRequest.isPending}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {makeRequest.isPending ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>

          {/* Response Display */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-6">Response</h2>

            {response && (
              <div className="h-full overflow-auto">
                <SyntaxHighlighter
                  language="json"
                  style={vscDarkPlus}
                  className="rounded-lg"
                >
                  {JSON.stringify(response, null, 2)}
                </SyntaxHighlighter>
              </div>
            )}

            {!response && (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Make a request to see the response here
              </div>
            )}
          </div>
        </div>
      );
    };

Real-time Features
==================

WebSocket Integration
---------------------

.. container:: justify-text

    The FARM stack GUI leverages WebSocket connections for real-time data updates and collaborative features:

**Real-time Data Streaming:**

.. code-block:: python

    # Backend WebSocket handler
    from fastapi import WebSocket, WebSocketDisconnect
    from typing import Dict, List
    import asyncio
    import json

    class ConnectionManager:
        def __init__(self):
            self.active_connections: Dict[str, List[WebSocket]] = {}

        async def connect(self, websocket: WebSocket, room: str):
            await websocket.accept()
            if room not in self.active_connections:
                self.active_connections[room] = []
            self.active_connections[room].append(websocket)

        def disconnect(self, websocket: WebSocket, room: str):
            if room in self.active_connections:
                self.active_connections[room].remove(websocket)

        async def broadcast_to_room(self, message: dict, room: str):
            if room in self.active_connections:
                for connection in self.active_connections[room]:
                    try:
                        await connection.send_text(json.dumps(message))
                    except:
                        # Remove dead connections
                        self.active_connections[room].remove(connection)

    manager = ConnectionManager()

    @app.websocket("/ws/resistance/{organism}/{antibiotic}")
    async def websocket_resistance_updates(
        websocket: WebSocket,
        organism: str,
        antibiotic: str
    ):
        room = f"{organism}_{antibiotic}"
        await manager.connect(websocket, room)

        try:
            while True:
                # Send periodic updates
                latest_data = await get_latest_resistance_data(organism, antibiotic)
                await manager.broadcast_to_room(latest_data, room)
                await asyncio.sleep(60)  # Update every minute

        except WebSocketDisconnect:
            manager.disconnect(websocket, room)

**Frontend WebSocket Hook:**

.. code-block:: typescript

    // src/hooks/useWebSocket.ts
    import { useEffect, useRef, useState } from 'react';

    interface UseWebSocketOptions {
      shouldReconnect?: () => boolean;
      reconnectAttempts?: number;
      reconnectInterval?: number;
    }

    export const useWebSocket = (
      url: string,
      options: UseWebSocketOptions = {}
    ) => {
      const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
      const [connectionStatus, setConnectionStatus] = useState<'Connecting' | 'Open' | 'Closed'>('Connecting');
      const ws = useRef<WebSocket | null>(null);
      const reconnectAttempts = useRef(0);

      const connect = () => {
        try {
          ws.current = new WebSocket(url);

          ws.current.onopen = () => {
            setConnectionStatus('Open');
            reconnectAttempts.current = 0;
          };

          ws.current.onmessage = (event) => {
            setLastMessage(event);
          };

          ws.current.onclose = () => {
            setConnectionStatus('Closed');

            if (
              options.shouldReconnect?.() &&
              reconnectAttempts.current < (options.reconnectAttempts ?? 5)
            ) {
              setTimeout(() => {
                reconnectAttempts.current++;
                connect();
              }, options.reconnectInterval ?? 3000);
            }
          };
        } catch (error) {
          console.error('WebSocket connection failed:', error);
          setConnectionStatus('Closed');
        }
      };

      useEffect(() => {
        connect();

        return () => {
          ws.current?.close();
        };
      }, [url]);

      const sendMessage = (message: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(message);
        }
      };

      return { lastMessage, connectionStatus, sendMessage };
    };

Progressive Web App Features
----------------------------

**Service Worker Configuration:**

.. code-block:: javascript

    // public/sw.js
    const CACHE_NAME = 'amrnet-farm-v1';
    const urlsToCache = [
      '/',
      '/manifest.json',
      '/static/js/bundle.js',
      '/static/css/main.css',
      '/api/v2/organisms',
    ];

    self.addEventListener('install', (event) => {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then((cache) => cache.addAll(urlsToCache))
      );
    });

    self.addEventListener('fetch', (event) => {
      // Cache-first strategy for static assets
      if (event.request.url.includes('/static/')) {
        event.respondWith(
          caches.match(event.request)
            .then((response) => response || fetch(event.request))
        );
      }

      // Network-first strategy for API calls
      if (event.request.url.includes('/api/')) {
        event.respondWith(
          fetch(event.request)
            .catch(() => caches.match(event.request))
        );
      }
    });

**Offline Data Management:**

.. code-block:: typescript

    // src/utils/offlineStorage.ts
    import { openDB, DBSchema, IDBPDatabase } from 'idb';

    interface AMRnetDB extends DBSchema {
      organisms: {
        key: string;
        value: {
          id: string;
          data: any;
          timestamp: number;
        };
      };
      resistance_data: {
        key: string;
        value: {
          organism: string;
          filters: string;
          data: any;
          timestamp: number;
        };
      };
    }

    class OfflineStorage {
      private db: IDBPDatabase<AMRnetDB> | null = null;

      async init() {
        this.db = await openDB<AMRnetDB>('amrnet-cache', 1, {
          upgrade(db) {
            db.createObjectStore('organisms');
            db.createObjectStore('resistance_data');
          },
        });
      }

      async cacheOrganismData(organismId: string, data: any) {
        if (!this.db) await this.init();

        await this.db!.put('organisms', {
          id: organismId,
          data,
          timestamp: Date.now(),
        }, organismId);
      }

      async getCachedOrganismData(organismId: string) {
        if (!this.db) await this.init();

        const cached = await this.db!.get('organisms', organismId);

        // Return cached data if less than 1 hour old
        if (cached && Date.now() - cached.timestamp < 3600000) {
          return cached.data;
        }

        return null;
      }

      async clearExpiredCache() {
        if (!this.db) await this.init();

        const cutoff = Date.now() - 86400000; // 24 hours

        const tx = this.db!.transaction(['organisms', 'resistance_data'], 'readwrite');

        // Clear expired organism data
        const organismCursor = await tx.objectStore('organisms').openCursor();
        while (organismCursor) {
          if (organismCursor.value.timestamp < cutoff) {
            await organismCursor.delete();
          }
          await organismCursor.continue();
        }

        await tx.done;
      }
    }

    export const offlineStorage = new OfflineStorage();

Accessibility Features
======================

.. container:: justify-text

    The FARM stack GUI prioritizes accessibility to ensure the platform is usable by all researchers, regardless of their abilities:

**WCAG 2.1 AA Compliance:**

.. code-block:: typescript

    // src/components/atoms/AccessibleButton.tsx
    import React, { forwardRef } from 'react';
    import { motion } from 'framer-motion';

    interface AccessibleButtonProps
      extends React.ButtonHTMLAttributes<HTMLButtonElement> {
      variant?: 'primary' | 'secondary' | 'danger';
      size?: 'sm' | 'md' | 'lg';
      loading?: boolean;
      icon?: React.ReactNode;
      children: React.ReactNode;
    }

    export const AccessibleButton = forwardRef<
      HTMLButtonElement,
      AccessibleButtonProps
    >(({
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      children,
      disabled,
      ...props
    }, ref) => {
      const baseClasses = `
        inline-flex items-center justify-center
        font-medium rounded-lg transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${loading ? 'cursor-wait' : 'cursor-pointer'}
      `;

      const variantClasses = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
        danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
      };

      const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      };

      return (
        <motion.button
          ref={ref}
          whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
          whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
          className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
          disabled={disabled || loading}
          aria-busy={loading}
          aria-describedby={loading ? 'loading-text' : undefined}
          {...props}
        >
          {loading && (
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                className="opacity-25"
              />
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                className="opacity-75"
              />
            </svg>
          )}
          {icon && !loading && <span className="mr-2">{icon}</span>}
          <span>{children}</span>
          {loading && (
            <span id="loading-text" className="sr-only">
              Loading, please wait
            </span>
          )}
        </motion.button>
      );
    });

**Screen Reader Support:**

.. code-block:: typescript

    // src/components/molecules/DataTable.tsx
    import React from 'react';

    interface DataTableProps {
      data: any[];
      columns: Array<{
        key: string;
        label: string;
        sortable?: boolean;
        format?: (value: any) => string;
      }>;
      caption: string;
      sortBy?: string;
      sortDirection?: 'asc' | 'desc';
      onSort?: (column: string) => void;
    }

    export const DataTable: React.FC<DataTableProps> = ({
      data,
      columns,
      caption,
      sortBy,
      sortDirection,
      onSort,
    }) => {
      return (
        <div className="overflow-x-auto">
          <table
            className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
            role="table"
            aria-label={caption}
          >
            <caption className="sr-only">{caption}</caption>

            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr role="row">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`
                      px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                      ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                    `}
                    onClick={column.sortable ? () => onSort?.(column.key) : undefined}
                    onKeyDown={(e) => {
                      if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onSort?.(column.key);
                      }
                    }}
                    tabIndex={column.sortable ? 0 : -1}
                    role={column.sortable ? 'columnheader button' : 'columnheader'}
                    aria-sort={
                      sortBy === column.key
                        ? sortDirection === 'asc' ? 'ascending' : 'descending'
                        : 'none'
                    }
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && (
                        <span className="ml-2">
                          {sortBy === column.key ? (
                            sortDirection === 'asc' ? '↑' : '↓'
                          ) : (
                            <span className="text-gray-400">↕</span>
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  role="row"
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                      role="gridcell"
                    >
                      {column.format
                        ? column.format(row[column.key])
                        : row[column.key]
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

Deployment and Performance
==========================

.. container:: justify-text

    The FARM stack is optimized for production deployment with modern DevOps practices:

**Docker Configuration:**

.. code-block:: dockerfile

    # Dockerfile.frontend
    FROM node:18-alpine as builder

    WORKDIR /app
    COPY package*.json ./
    RUN npm ci --only=production

    COPY . .
    RUN npm run build

    FROM nginx:alpine
    COPY --from=builder /app/dist /usr/share/nginx/html
    COPY nginx.conf /etc/nginx/nginx.conf

    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]

.. code-block:: dockerfile

    # Dockerfile.backend
    FROM python:3.11-slim

    WORKDIR /app

    COPY requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt

    COPY . .

    EXPOSE 8000
    CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

**Performance Optimization:**

.. code-block:: typescript

    // src/utils/performance.ts
    import { memo, useMemo, useCallback } from 'react';

    // Memoized component example
    export const MemoizedResistanceChart = memo(ResistanceChart, (prevProps, nextProps) => {
      return (
        prevProps.organism === nextProps.organism &&
        prevProps.antibiotic === nextProps.antibiotic &&
        prevProps.country === nextProps.country
      );
    });

    // Virtual scrolling for large datasets
    import { FixedSizeList as List } from 'react-window';

    export const VirtualizedTable: React.FC<{
      data: any[];
      height: number;
      rowHeight: number;
    }> = ({ data, height, rowHeight }) => {
      const Row = useCallback(({ index, style }: any) => (
        <div style={style}>
          {/* Row content */}
        </div>
      ), []);

      return (
        <List
          height={height}
          itemCount={data.length}
          itemSize={rowHeight}
          overscanCount={5}
        >
          {Row}
        </List>
      );
    };

Getting Started
===============

Development Setup
-----------------

.. container:: justify-text

    Set up the FARM stack development environment:

**1. Clone and Install Dependencies:**

.. code-block:: bash

    # Clone the repository
    git clone https://github.com/amrnet/amrnet-farm.git
    cd amrnet-farm

    # Install frontend dependencies
    cd frontend
    npm install

    # Install backend dependencies
    cd ../backend
    pip install -r requirements.txt

**2. Environment Configuration:**

.. code-block:: bash

    # Frontend environment (.env.local)
    NEXT_PUBLIC_API_URL=http://localhost:8000
    NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
    NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

    # Backend environment (.env)
    MONGODB_URI=mongodb://localhost:27017/amrnet
    JWT_SECRET=your_jwt_secret
    CORS_ORIGINS=["http://localhost:3000"]

**3. Start Development Servers:**

.. code-block:: bash

    # Terminal 1: Backend server
    cd backend
    uvicorn main:app --reload --port 8000

    # Terminal 2: Frontend server
    cd frontend
    npm run dev

**4. Access the Application:**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

Production Deployment
---------------------

.. container:: justify-text

    Deploy using Docker Compose for production:

.. code-block:: yaml

    # docker-compose.prod.yml
    version: '3.8'

    services:
      frontend:
        build:
          context: ./frontend
          dockerfile: Dockerfile.prod
        ports:
          - "80:80"
          - "443:443"
        environment:
          - NODE_ENV=production
        volumes:
          - ./nginx/ssl:/etc/nginx/ssl

      backend:
        build:
          context: ./backend
          dockerfile: Dockerfile.prod
        ports:
          - "8000:8000"
        environment:
          - MONGODB_URI=${MONGODB_URI}
          - JWT_SECRET=${JWT_SECRET}
        depends_on:
          - mongodb

      mongodb:
        image: mongo:6.0
        restart: always
        ports:
          - "27017:27017"
        environment:
          - MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME}
          - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
        volumes:
          - mongodb_data:/data/db

      redis:
        image: redis:7-alpine
        restart: always
        ports:
          - "6379:6379"
        volumes:
          - redis_data:/data

    volumes:
      mongodb_data:
      redis_data:

Support and Community
=====================

.. container:: justify-text

    Get help with the FARM stack implementation:

Resources
---------

- **📖 Component Library**: Storybook documentation at `storybook.amrnet.org <https://storybook.amrnet.org>`_
- **🎨 Design System**: Figma design tokens and components
- **🧪 Testing Guide**: Jest and Cypress testing patterns
- **🚀 Deployment Guide**: Production deployment best practices

Contributing
------------

.. container:: justify-text

    Contribute to the FARM stack development:

1. **Frontend Issues**: React components, UI/UX improvements
2. **Backend Issues**: FastAPI endpoints, performance optimization
3. **Documentation**: User guides and API documentation
4. **Testing**: Unit tests, integration tests, e2e tests

**Development Workflow:**

.. code-block:: bash

    # Create feature branch
    git checkout -b feature/new-visualization

    # Make changes and test
    npm run test
    npm run lint
    npm run type-check

    # Commit and push
    git commit -m "Add new resistance trend visualization"
    git push origin feature/new-visualization

    # Create pull request

Future Roadmap
==============

.. container:: justify-text

    Planned enhancements for the FARM stack GUI:

**Q1 2025:**
- 🤖 AI-powered data insights and recommendations
- 📱 Native mobile applications (React Native)
- 🔍 Advanced search with natural language queries
- 📊 Custom dashboard builder interface

**Q2 2025:**
- 🌐 Multi-language support expansion (Chinese, Arabic, Hindi)
- 🔒 Advanced security features (2FA, SSO integration)
- 📈 Machine learning model explanations
- 🎮 Gamification for data exploration

**Q3 2025:**
- 🗣️ Voice interface for accessibility
- 🔗 Enhanced data integration (HL7 FHIR, SNOMED CT)
- 📋 Collaborative workspaces and sharing
- 🎯 Personalized research recommendations

**Long-term Vision:**
- Virtual reality data exploration environments
- Blockchain-based data provenance tracking
- Quantum computing integration for complex analyses
- Global real-time surveillance network integration
