'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSubagentActivity, useClawBotAgentStatus } from '../../../lib/hooks-live';
import type { SubagentTask, ClawBotAgentStatus } from '../../../lib/hooks-live';

// ============================================================================
// THE SYNDICATE HQ — 3D Environment
// ============================================================================

const GOLD = '#D4A843';
const BG = '#0A0A0F';

// ============================================================================
// Room definitions
// ============================================================================
interface RoomDef {
  x: number;
  z: number;
  label: string;
  color: string;
}

const rooms: Record<string, RoomDef> = {
  'command':     { x: 0, z: 0, label: 'COMMAND', color: '#D4A843' },
  'dark-corner': { x: -6, z: -4, label: 'DARK CORNER', color: '#8B5CF6' },
  'studio':      { x: -6, z: 2, label: 'STUDIO', color: '#EC4899' },
  'lab':         { x: 6, z: -4, label: 'THE LAB', color: '#22C55E' },
  'intel':       { x: 6, z: 2, label: 'INTEL', color: '#3B82F6' },
  'break-room':  { x: -6, z: 6, label: 'BREAK ROOM', color: '#F97316' },
  'data-center': { x: 0, z: 6, label: 'DATA CENTER', color: '#06B6D4' },
  'vault':       { x: 6, z: 6, label: 'THE VAULT', color: '#D4A843' },
};

// ============================================================================
// Agent definitions
// ============================================================================
interface AgentDef {
  id: string;
  name: string;
  workRoom: string;
  idleRoom: string;
  color: string;
}

const agentDefs: AgentDef[] = [
  { id: 'jarvis', name: 'The Architect', workRoom: 'command', idleRoom: 'command', color: '#D4A843' },
  { id: 'xavier', name: 'The Ghost', workRoom: 'dark-corner', idleRoom: 'break-room', color: '#8B5CF6' },
  { id: 'giulia', name: 'The Face', workRoom: 'studio', idleRoom: 'break-room', color: '#EC4899' },
  { id: 'neura', name: 'The Chemist', workRoom: 'lab', idleRoom: 'break-room', color: '#22C55E' },
  { id: 'zuyrb', name: 'The Forger', workRoom: 'studio', idleRoom: 'break-room', color: '#F59E0B' },
  { id: 'raffe', name: 'The Fox', workRoom: 'studio', idleRoom: 'break-room', color: '#EF4444' },
  { id: 'informant', name: 'The Informant', workRoom: 'intel', idleRoom: 'break-room', color: '#3B82F6' },
  { id: 'banker', name: 'The Banker', workRoom: 'vault', idleRoom: 'break-room', color: '#D4A843' },
  { id: 'oracle', name: 'The Oracle', workRoom: 'data-center', idleRoom: 'break-room', color: '#06B6D4' },
];

// ============================================================================
// Determine agent status from subagent data + ClawBot queue
// ============================================================================
type AgentStatus = 'working' | 'idle' | 'error';

// Map ClawBot agent IDs to Syndicate agent IDs
const CLAWBOT_TO_SYNDICATE: Record<string, string> = {
  orchestrator: 'jarvis',
  copywriter: 'giulia',
  designer: 'zuyrb',
  frontend: 'raffe',
  backend: 'informant',
  reviewer: 'xavier',
  sensei: 'jarvis',
  oracle: 'oracle',
  devil: 'banker',
};

interface AgentMissionInfo {
  status: AgentStatus;
  currentMission?: string;
}

function getAgentStatuses(
  data: { running: SubagentTask[]; recent: SubagentTask[] } | null,
  clawbotAgents?: ClawBotAgentStatus[],
): Record<string, AgentMissionInfo> {
  const statuses: Record<string, AgentMissionInfo> = {};
  for (const a of agentDefs) statuses[a.id] = { status: 'idle' };

  // Layer 1: ClawBot autonomous queue status
  if (clawbotAgents) {
    for (const agent of clawbotAgents) {
      const syndicateId = CLAWBOT_TO_SYNDICATE[agent.agentId];
      if (syndicateId && agent.status === 'working') {
        statuses[syndicateId] = {
          status: 'working',
          currentMission: agent.currentMission,
        };
      }
    }
  }

  // Layer 2: Live OpenClaw subagent tasks (override if running)
  if (data) {
    const labelMap: Record<string, string> = {
      'syndicate': 'jarvis',
      'jarvis': 'jarvis',
      'xavier': 'xavier',
      'reddit': 'xavier',
      'giulia': 'giulia',
      'content': 'giulia',
      'neura': 'neura',
      'video': 'neura',
      'zuyrb': 'zuyrb',
      'forge': 'zuyrb',
      'raffe': 'raffe',
      'fox': 'raffe',
      'informant': 'informant',
      'intel': 'informant',
      'research': 'informant',
      'banker': 'banker',
      'finance': 'banker',
      'oracle': 'oracle',
      'analytics': 'oracle',
      'data': 'oracle',
    };

    for (const task of (data.running || [])) {
      const label = (task.label || '').toLowerCase();
      for (const [key, agentId] of Object.entries(labelMap)) {
        if (label.includes(key)) {
          statuses[agentId] = { status: 'working', currentMission: task.label };
          break;
        }
      }
    }

    for (const task of (data.recent || []).slice(0, 10)) {
      if (task.status === 'error') {
        const label = (task.label || '').toLowerCase();
        for (const [key, agentId] of Object.entries(labelMap)) {
          if (label.includes(key) && statuses[agentId].status !== 'working') {
            statuses[agentId] = { status: 'error' };
            break;
          }
        }
      }
    }
  }

  return statuses;
}

// ============================================================================
// Room Label — uses Html instead of Text (no font download needed)
// ============================================================================
function RoomLabel({ label, color }: { label: string; color: string }) {
  return (
    <Html
      position={[0, 0.25, -1.5]}
      center
      distanceFactor={12}
      style={{ pointerEvents: 'none' }}
    >
      <div style={{
        color,
        fontSize: 11,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        letterSpacing: 2,
        textShadow: `0 0 8px ${color}60, 0 0 4px rgba(0,0,0,0.9)`,
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}>
        {label}
      </div>
    </Html>
  );
}

// ============================================================================
// Room Platform Component
// ============================================================================
function RoomPlatform({ room, id, hasActiveAgents }: { room: RoomDef; id: string; hasActiveAgents: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const color = new THREE.Color(room.color);

  useFrame((_, delta) => {
    if (lightRef.current) {
      const target = hasActiveAgents ? 2.5 : 0.8;
      lightRef.current.intensity += (target - lightRef.current.intensity) * delta * 2;
    }
  });

  return (
    <group position={[room.x, 0, room.z]}>
      {/* Platform */}
      <mesh ref={meshRef} position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[4.5, 0.1, 3.5]} />
        <meshStandardMaterial
          color="#111116"
          emissive={color}
          emissiveIntensity={0.05}
          roughness={0.8}
        />
      </mesh>

      {/* Room border glow */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[4.6, 0.02, 3.6]} />
        <meshStandardMaterial
          color={room.color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Point light */}
      <pointLight
        ref={lightRef}
        position={[0, 3, 0]}
        color={room.color}
        intensity={hasActiveAgents ? 2.5 : 0.8}
        distance={8}
        decay={2}
      />

      {/* Room label — Html instead of Text */}
      <RoomLabel label={room.label} color={room.color} />

      {/* Low walls */}
      <Walls />

      {/* Room-specific furniture */}
      <RoomFurniture roomId={id} color={room.color} />
    </group>
  );
}

// ============================================================================
// Low transparent walls
// ============================================================================
function Walls() {
  const wallMat = useMemo(() => (
    <meshStandardMaterial
      color="#1A1A22"
      transparent
      opacity={0.3}
      roughness={0.9}
    />
  ), []);

  return (
    <>
      <mesh position={[0, 0.4, -1.75]}>
        <boxGeometry args={[4.5, 0.7, 0.05]} />
        {wallMat}
      </mesh>
      <mesh position={[-2.25, 0.4, 0]}>
        <boxGeometry args={[0.05, 0.7, 3.5]} />
        {wallMat}
      </mesh>
      <mesh position={[2.25, 0.4, 0]}>
        <boxGeometry args={[0.05, 0.7, 3.5]} />
        {wallMat}
      </mesh>
    </>
  );
}

// ============================================================================
// Room-specific furniture
// ============================================================================
function RoomFurniture({ roomId, color }: { roomId: string; color: string }) {
  const emissiveColor = new THREE.Color(color);

  switch (roomId) {
    case 'command':
      return (
        <group>
          <mesh position={[0, 1.2, -1.4]}>
            <boxGeometry args={[3, 1.5, 0.05]} />
            <meshStandardMaterial
              color="#000"
              emissive={emissiveColor}
              emissiveIntensity={0.8}
              transparent
              opacity={0.9}
            />
          </mesh>
          <mesh position={[0, 0.35, 0.3]}>
            <boxGeometry args={[2.5, 0.08, 1]} />
            <meshStandardMaterial color="#1A1A22" roughness={0.5} />
          </mesh>
        </group>
      );
    case 'dark-corner':
      return (
        <group>
          <mesh position={[-0.8, 0.35, 0]}>
            <boxGeometry args={[1.2, 0.08, 0.6]} />
            <meshStandardMaterial color="#1A1A22" />
          </mesh>
          <mesh position={[-0.8, 0.8, -1.4]}>
            <boxGeometry args={[1.2, 0.8, 0.04]} />
            <meshStandardMaterial color="#000" emissive={emissiveColor} emissiveIntensity={0.5} />
          </mesh>
        </group>
      );
    case 'studio':
      return (
        <group>
          {[-1, 0, 1].map(i => (
            <mesh key={i} position={[i * 1.2, 0.35, 0.2]}>
              <boxGeometry args={[0.9, 0.08, 0.6]} />
              <meshStandardMaterial color="#1A1A22" />
            </mesh>
          ))}
          {[-1, 0, 1].map(i => (
            <mesh key={`s${i}`} position={[i * 1.2, 0.8, -0.1]}>
              <boxGeometry args={[0.7, 0.5, 0.03]} />
              <meshStandardMaterial color="#000" emissive={emissiveColor} emissiveIntensity={0.6} />
            </mesh>
          ))}
        </group>
      );
    case 'lab':
      return (
        <group>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[2.5, 0.08, 1.2]} />
            <meshStandardMaterial color="#1A1A22" />
          </mesh>
          <mesh position={[0, 0.9, -1.4]}>
            <boxGeometry args={[2, 1, 0.04]} />
            <meshStandardMaterial color="#000" emissive={emissiveColor} emissiveIntensity={0.5} />
          </mesh>
        </group>
      );
    case 'intel':
      return (
        <group>
          <mesh position={[0, 0.35, 0.3]}>
            <boxGeometry args={[1.8, 0.08, 0.8]} />
            <meshStandardMaterial color="#1A1A22" />
          </mesh>
          {[-0.7, 0, 0.7].map(i => (
            <mesh key={i} position={[i, 0.9, -1.4]}>
              <boxGeometry args={[0.6, 0.7, 0.03]} />
              <meshStandardMaterial color="#000" emissive={emissiveColor} emissiveIntensity={0.5} />
            </mesh>
          ))}
        </group>
      );
    case 'break-room':
      return (
        <group>
          <mesh position={[0, 0.3, 0.5]}>
            <boxGeometry args={[2.5, 0.3, 0.8]} />
            <meshStandardMaterial color="#2A1A0A" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.55, 0.85]}>
            <boxGeometry args={[2.5, 0.4, 0.15]} />
            <meshStandardMaterial color="#2A1A0A" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.2, -0.3]}>
            <boxGeometry args={[1.2, 0.05, 0.5]} />
            <meshStandardMaterial color="#1A1A22" />
          </mesh>
        </group>
      );
    case 'data-center':
      return <ServerRacks color={color} />;
    case 'vault':
      return (
        <group>
          <mesh position={[0, 0.35, 0.2]}>
            <boxGeometry args={[1.5, 0.08, 0.7]} />
            <meshStandardMaterial color="#1A1A22" />
          </mesh>
          <mesh position={[0, 1, -1.4]}>
            <boxGeometry args={[2, 1.2, 0.04]} />
            <meshStandardMaterial color="#000" emissive={emissiveColor} emissiveIntensity={0.7} />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}

// ============================================================================
// Server racks with blinking lights
// ============================================================================
function ServerRacks({ color }: { color: string }) {
  const lightsRef = useRef<THREE.PointLight[]>([]);
  const emissiveColor = new THREE.Color(color);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    lightsRef.current.forEach((light, i) => {
      if (light) {
        light.intensity = 0.3 + Math.sin(t * 3 + i * 1.5) * 0.3;
      }
    });
  });

  return (
    <group>
      {[-1.2, -0.4, 0.4, 1.2].map((xOff, i) => (
        <group key={i} position={[xOff, 0, -0.5]}>
          <mesh position={[0, 0.7, 0]}>
            <boxGeometry args={[0.5, 1.3, 0.4]} />
            <meshStandardMaterial
              color="#0A0A12"
              emissive={emissiveColor}
              emissiveIntensity={0.15}
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>
          <pointLight
            ref={el => { if (el) lightsRef.current[i] = el; }}
            position={[0, 0.8, 0.3]}
            color={color}
            intensity={0.5}
            distance={2}
            decay={2}
          />
        </group>
      ))}
    </group>
  );
}

// ============================================================================
// Gold floating particles — simple small box meshes instead of Points/PointMaterial
// ============================================================================
function GoldParticles() {
  const count = 80; // fewer than before, but mesh-based is heavier
  const particles = useMemo(() => {
    const arr: { x: number; y: number; z: number; speed: number }[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 20,
        y: Math.random() * 6 + 0.5,
        z: (Math.random() - 0.5) * 16 + 1,
        speed: 0.3 + Math.random() * 0.7,
      });
    }
    return arr;
  }, []);

  return (
    <group>
      {particles.map((p, i) => (
        <GoldParticle key={i} x={p.x} y={p.y} z={p.z} speed={p.speed} index={i} />
      ))}
    </group>
  );
}

function GoldParticle({ x, y, z, speed, index }: { x: number; y: number; z: number; speed: number; index: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = y + Math.sin(t * speed + index) * 0.5;
    if (ref.current.position.y > 7) ref.current.position.y = 0.5;
  });

  return (
    <mesh ref={ref} position={[x, y, z]}>
      <boxGeometry args={[0.03, 0.03, 0.03]} />
      <meshBasicMaterial color="#D4A843" transparent opacity={0.5} />
    </mesh>
  );
}

// ============================================================================
// Agent Character Component (3D)
// ============================================================================
function AgentCharacter({
  agent,
  targetPosition,
  status,
  currentMission,
}: {
  agent: AgentDef;
  targetPosition: [number, number, number];
  status: AgentStatus;
  currentMission?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(...targetPosition));
  const target = useMemo(() => new THREE.Vector3(...targetPosition), [targetPosition]);
  const agentColor = new THREE.Color(agent.color);

  const statusColor = status === 'working' ? '#22C55E' : status === 'error' ? '#EF4444' : '#F59E0B';

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;

    currentPos.current.lerp(target, delta * 2);
    groupRef.current.position.copy(currentPos.current);

    const t = clock.getElapsedTime();

    if (status === 'working') {
      groupRef.current.position.y = currentPos.current.y + Math.abs(Math.sin(t * 4)) * 0.15;
    } else {
      groupRef.current.position.y = currentPos.current.y + Math.sin(t * 1.5) * 0.03;
      groupRef.current.rotation.y = Math.sin(t * 0.8) * 0.1;
    }
  });

  // Truncate mission name for badge
  const missionLabel = currentMission
    ? currentMission.length > 30 ? currentMission.slice(0, 28) + '...' : currentMission
    : null;

  return (
    <group ref={groupRef} position={targetPosition}>
      {/* Status ring at feet */}
      <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.25, 0.32, 24]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={new THREE.Color(statusColor)}
          emissiveIntensity={1}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Glow ring for working agents */}
      {status === 'working' && (
        <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.33, 0.45, 24]} />
          <meshStandardMaterial
            color={statusColor}
            emissive={new THREE.Color(statusColor)}
            emissiveIntensity={0.6}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}

      {/* Body (cylinder) */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.5, 8]} />
        <meshStandardMaterial
          color={agent.color}
          emissive={agentColor}
          emissiveIntensity={status === 'working' ? 0.4 : 0.2}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Head (sphere) */}
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial
          color={agent.color}
          emissive={agentColor}
          emissiveIntensity={status === 'working' ? 0.35 : 0.15}
          roughness={0.3}
        />
      </mesh>

      {/* Name label + mission badge — Html */}
      <Html
        position={[0, 1.3, 0]}
        center
        distanceFactor={10}
        style={{ pointerEvents: 'none' }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}>
          <div style={{
            color: agent.color,
            fontSize: 10,
            fontFamily: 'monospace',
            fontWeight: 'bold',
            textShadow: '0 0 6px rgba(0,0,0,0.9)',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            background: 'rgba(0,0,0,0.6)',
            padding: '2px 6px',
            borderRadius: 3,
            border: `1px solid ${agent.color}40`,
          }}>
            {agent.name}
          </div>
          {status === 'working' && missionLabel && (
            <div style={{
              color: '#22C55E',
              fontSize: 8,
              fontFamily: 'monospace',
              background: 'rgba(0,0,0,0.75)',
              padding: '1px 5px',
              borderRadius: 2,
              border: '1px solid #22C55E30',
              whiteSpace: 'nowrap',
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              ⚡ {missionLabel}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

// ============================================================================
// Floor with grid
// ============================================================================
function Floor() {
  return (
    <group>
      <mesh position={[0, -0.01, 1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 20]} />
        <meshStandardMaterial color="#0A0A0F" roughness={0.95} />
      </mesh>
      <gridHelper
        args={[24, 24, '#D4A84320', '#D4A84310']}
        position={[0, 0.01, 1]}
      />
    </group>
  );
}

// ============================================================================
// Scene setup (lighting, fog, camera)
// ============================================================================
function SceneSetup() {
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new THREE.FogExp2('#0A0A0F', 0.04);
    scene.background = new THREE.Color('#0A0A0F');
  }, [scene]);

  return null;
}

// ============================================================================
// Main 3D Scene (inside Canvas)
// ============================================================================
function HQScene({ agentStatuses }: { agentStatuses: Record<string, AgentMissionInfo> }) {
  const agentPositions = useMemo(() => {
    const positions: Record<string, [number, number, number]> = {};
    const roomOccupants: Record<string, number> = {};

    for (const agent of agentDefs) {
      const info = agentStatuses[agent.id] || { status: 'idle' };
      const roomId = info.status === 'working' || info.status === 'error' ? agent.workRoom : agent.idleRoom;
      const room = rooms[roomId];
      if (!room) continue;

      const occupantIndex = roomOccupants[roomId] || 0;
      roomOccupants[roomId] = occupantIndex + 1;

      const offsetX = (occupantIndex % 3 - 1) * 0.8;
      const offsetZ = Math.floor(occupantIndex / 3) * 0.8;

      positions[agent.id] = [room.x + offsetX, 0.1, room.z + offsetZ];
    }

    return positions;
  }, [agentStatuses]);

  const activeRooms = useMemo(() => {
    const active = new Set<string>();
    for (const agent of agentDefs) {
      const info = agentStatuses[agent.id];
      if (info && info.status === 'working') {
        active.add(agent.workRoom);
      }
    }
    return active;
  }, [agentStatuses]);

  return (
    <>
      <SceneSetup />
      <ambientLight intensity={0.08} color="#ffffff" />

      {Object.entries(rooms).map(([id, room]) => (
        <RoomPlatform
          key={id}
          id={id}
          room={room}
          hasActiveAgents={activeRooms.has(id)}
        />
      ))}

      <Floor />

      {agentDefs.map(agent => {
        const info = agentStatuses[agent.id] || { status: 'idle' as AgentStatus };
        return (
          <AgentCharacter
            key={agent.id}
            agent={agent}
            targetPosition={agentPositions[agent.id] || [0, 0.1, 0]}
            status={info.status}
            currentMission={info.currentMission}
          />
        );
      })}

      <GoldParticles />

      <OrbitControls
        target={[0, 0, 2]}
        maxPolarAngle={Math.PI / 2.3}
        minDistance={5}
        maxDistance={25}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

// ============================================================================
// Activity Feed
// ============================================================================
function ActivityFeed({ tasks }: { tasks: SubagentTask[] }) {
  const recent = useMemo(() => {
    return [...(tasks || [])].sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0)).slice(0, 8);
  }, [tasks]);

  if (recent.length === 0) return null;

  return (
    <div style={{
      maxHeight: 150,
      overflowY: 'auto',
      scrollbarWidth: 'none',
    }}>
      {recent.map((t, i) => {
        const icon = t.status === 'running' ? '⚡' : t.status === 'done' ? '✅' : t.status === 'error' ? '❌' : '💀';
        const ago = t.startedAt ? formatAgo(Date.now() - t.startedAt) : '';
        return (
          <div key={t.runId || i} style={{
            fontSize: 11,
            color: '#AAA',
            padding: '2px 0',
            borderBottom: '1px solid #ffffff08',
            fontFamily: 'monospace',
          }}>
            {icon} <span style={{ color: '#D4A843' }}>{t.label || 'task'}</span>{' '}
            <span style={{ color: '#666' }}>{ago}</span>
          </div>
        );
      })}
    </div>
  );
}

function formatAgo(ms: number): string {
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  return `${hrs}h ago`;
}

// ============================================================================
// HUD Overlay (HTML on top of 3D)
// ============================================================================
function HUDOverlay({
  data,
  loading,
  error,
  agentStatuses,
}: {
  data: { running: SubagentTask[]; recent: SubagentTask[]; queued: SubagentTask[] } | null;
  loading: boolean;
  error: string | null;
  agentStatuses: Record<string, AgentMissionInfo>;
}) {
  const workingCount = Object.values(agentStatuses).filter(s => s.status === 'working').length;
  const allTasks = [...(data?.running || []), ...(data?.recent || [])];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();

  const todayTasks = allTasks.filter(t => t.startedAt >= todayMs);
  const todayTokens = todayTasks.reduce((sum, t) => sum + (t.totalTokens || 0), 0);
  const todayCost = (todayTokens / 1000) * 0.01;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthMs = monthStart.getTime();
  const monthTasks = allTasks.filter(t => t.startedAt >= monthMs);
  const monthTokens = monthTasks.reduce((sum, t) => sum + (t.totalTokens || 0), 0);
  const monthCost = (monthTokens / 1000) * 0.01;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      fontFamily: 'monospace',
      zIndex: 10,
    }}>
      {/* Top-left: Mission Targets */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        background: 'rgba(10,10,15,0.85)',
        border: '1px solid #D4A84330',
        borderRadius: 8,
        padding: '12px 16px',
        pointerEvents: 'auto',
        minWidth: 220,
      }}>
        <div style={{ color: GOLD, fontSize: 12, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 }}>
          🎯 MISSION TARGETS
        </div>
        <MissionTarget label="🇸🇮 AI Universa" target="€1.1M" current="€0" progress={0} />
        <MissionTarget label="🤖 AIB" target="€100K/mo" current="€0" progress={0} />
        <MissionTarget label="💎 SAAS" target="€50K/mo" current="€0" progress={0} />
      </div>

      {/* Top-right: Cost Tracker */}
      <div style={{
        position: 'absolute',
        top: 16,
        right: 16,
        background: 'rgba(10,10,15,0.85)',
        border: '1px solid #D4A84330',
        borderRadius: 8,
        padding: '12px 16px',
        pointerEvents: 'auto',
        textAlign: 'right',
      }}>
        <div style={{ color: GOLD, fontSize: 12, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 }}>
          💰 COSTS
        </div>
        <div style={{ color: '#E8E8E8', fontSize: 13 }}>
          Today: <span style={{ color: '#22C55E' }}>${todayCost.toFixed(2)}</span>
        </div>
        <div style={{ color: '#E8E8E8', fontSize: 13 }}>
          Month: <span style={{ color: '#22C55E' }}>${monthCost.toFixed(2)}</span>
        </div>
        <div style={{ color: '#666', fontSize: 10, marginTop: 4 }}>
          {workingCount} agent{workingCount !== 1 ? 's' : ''} active
        </div>
      </div>

      {/* Bottom: Activity Feed */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 200,
        background: 'rgba(10,10,15,0.85)',
        border: '1px solid #D4A84330',
        borderRadius: 8,
        padding: '10px 14px',
        pointerEvents: 'auto',
        maxWidth: 500,
      }}>
        <div style={{ color: GOLD, fontSize: 11, fontWeight: 'bold', marginBottom: 6, letterSpacing: 1 }}>
          📡 LIVE FEED
        </div>
        <ActivityFeed tasks={allTasks} />
      </div>

      {/* Bottom-right: Connection Status */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        background: 'rgba(10,10,15,0.85)',
        border: '1px solid #D4A84330',
        borderRadius: 8,
        padding: '8px 14px',
        pointerEvents: 'auto',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: error ? '#EF4444' : '#22C55E',
            boxShadow: `0 0 8px ${error ? '#EF4444' : '#22C55E'}`,
          }} />
          <span style={{
            color: error ? '#EF4444' : '#22C55E',
            fontSize: 12,
            fontWeight: 'bold',
            letterSpacing: 1,
          }}>
            {loading ? 'CONNECTING...' : error ? 'OFFLINE' : 'LIVE'}
          </span>
        </div>
      </div>

      {/* Title watermark */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#D4A84340',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 4,
      }}>
        THE SYNDICATE HQ
      </div>
    </div>
  );
}

function MissionTarget({ label, target, current, progress }: {
  label: string;
  target: string;
  current: string;
  progress: number;
}) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ color: '#E8E8E8', fontSize: 11 }}>
        {label}: <span style={{ color: GOLD }}>{target}</span>{' '}
        <span style={{ color: '#666' }}>/ {current}</span>
      </div>
      <div style={{
        height: 3,
        background: '#1A1A22',
        borderRadius: 2,
        marginTop: 3,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.max(progress * 100, 1)}%`,
          background: `linear-gradient(90deg, ${GOLD}, #F59E0B)`,
          borderRadius: 2,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
}

// ============================================================================
// Main Export — Wrapped Scene
// ============================================================================
export default function SyndicateScene() {
  const { data, loading, error } = useSubagentActivity();
  const { data: clawbotData } = useClawBotAgentStatus(10_000);
  const agentStatuses = useMemo(() => {
    try {
      return getAgentStatuses(data, clawbotData?.agents);
    } catch {
      return {} as Record<string, AgentMissionInfo>;
    }
  }, [data, clawbotData]);

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: BG,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Canvas
        camera={{
          position: [12, 10, 12],
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        shadows
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0A0A0F');
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <HQScene agentStatuses={agentStatuses} />
      </Canvas>

      <HUDOverlay
        data={data}
        loading={loading}
        error={error}
        agentStatuses={agentStatuses}
      />
    </div>
  );
}
