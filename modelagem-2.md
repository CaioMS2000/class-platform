## 📊 **VISÃO GERAL DOS CONTEXTOS E ENTIDADES**

```typescript
// Contextos e suas principais entidades
const contexts = {
  iam: ['User', 'Role', 'Permission', 'Session'],
  catalog: ['Course', 'Module', 'Lesson', 'Category', 'Instructor'],
  learning: ['Enrollment', 'Progress', 'WatchHistory', 'Note', 'Completion'],
  sales: ['Order', 'Cart', 'OrderItem', 'Coupon'],
  payment: ['Transaction', 'Invoice', 'PaymentMethod', 'Payout'],
  marketing: ['Affiliate', 'Commission', 'Campaign', 'Referral'],
  community: ['ForumPost', 'Comment', 'Reaction', 'Announcement']
}
```

## 1. **CONTEXTO IAM (Identity & Access Management)**

```typescript
// core/iam/domain/entities/User.ts
export class User {
  id: string                    // UUID
  email: string                 // unique
  password: string              // hashed
  name: string
  avatar?: string
  roles: Role[]                 // ['student', 'instructor', 'admin']
  status: UserStatus            // 'active' | 'blocked' | 'pending'
  
  // Metadados
  emailVerifiedAt?: Date
  lastLoginAt?: Date
  lastLoginIp?: string
  createdAt: Date
  updatedAt: Date
  
  // Preferências
  preferences: UserPreferences
}

// core/iam/domain/value-objects/UserPreferences.ts
export type UserPreferences = {
  language: 'pt-BR' | 'en' | 'es'
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    whatsapp: boolean
  }
  privacy: {
    showProgress: boolean
    showAchievements: boolean
  }
}

// core/iam/domain/entities/Session.ts
export class Session {
  id: string
  userId: string
  token: string
  refreshToken: string
  deviceInfo: {
    userAgent: string
    platform: string
    ip: string
  }
  expiresAt: Date
  createdAt: Date
}
```

## 2. **CONTEXTO CATALOG (Catálogo de Cursos)**

```typescript
// core/catalog/domain/entities/Course.ts
export class Course {
  id: string
  slug: string                  // url-friendly name
  title: string
  subtitle?: string
  description: string
  thumbnail: string
  coverImage?: string
  
  // Conteúdo
  modules: Module[]
  totalLessons: number
  totalDuration: number         // em minutos
  
  // Classificação
  categories: Category[]
  tags: string[]
  level: 'beginner' | 'intermediate' | 'advanced'
  
  // Preço
  price: Money
  promotionalPrice?: Money
  
  // Métricas
  rating: number                // média de 0-5
  totalRatings: number
  totalEnrollments: number
  
  // Status
  status: 'draft' | 'published' | 'archived'
  
  // Datas
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// core/catalog/domain/entities/Module.ts
export class Module {
  id: string
  courseId: string
  order: number
  title: string
  description?: string
  lessons: Lesson[]
  
  // Métricas
  totalLessons: number
  totalDuration: number
  
  createdAt: Date
  updatedAt: Date
}

// core/catalog/domain/entities/Lesson.ts
export class Lesson {
  id: string
  moduleId: string
  courseId: string
  order: number
  title: string
  description?: string
  
  // Conteúdo
  type: 'video' | 'article' | 'quiz' | 'exercise'
  content: {
    videoUrl?: string
    article?: string
    quiz?: Quiz
    exercise?: Exercise
    attachments?: Attachment[]
  }
  
  // Duração
  duration: number              // em minutos
  
  // Recursos
  resources?: Resource[]
  
  // Configurações
  isFree: boolean               // aula liberada mesmo sem matrícula
  requiresPrevious: boolean     // precisa completar anterior
  
  createdAt: Date
  updatedAt: Date
}

// core/catalog/domain/entities/Category.ts
export class Category {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  order: number
  icon?: string
}
```

## 3. **CONTEXTO LEARNING (Aprendizado & Progresso)**

```typescript
// core/learning/domain/entities/Enrollment.ts
export class Enrollment {
  id: string
  userId: string
  courseId: string
  status: 'active' | 'completed' | 'canceled' | 'expired'
  
  // Progresso
  progress: number              // 0-100
  completedLessons: number
  totalLessons: number
  
  // Acesso
  enrolledAt: Date
  expiresAt?: Date              // se tiver prazo
  lastAccessAt?: Date
  
  // Certificado
  certificateIssued?: boolean
  certificateUrl?: string
  completedAt?: Date
}

// core/learning/domain/entities/Progress.ts
export class Progress {
  id: string
  userId: string
  courseId: string
  lessonId: string
  
  // Status
  status: 'not_started' | 'in_progress' | 'completed'
  
  // Watch progress (para vídeos)
  watchTime: number             // segundos assistidos
  lastPosition: number          // último segundo
  completedAt?: Date
  
  // Interações
  notes?: Note[]
  quizAttempts?: QuizAttempt[]
  
  // Métricas
  timeSpent: number             // total em segundos
  deviceType?: string
  
  updatedAt: Date
}

// core/learning/domain/entities/Note.ts
export class Note {
  id: string
  userId: string
  lessonId: string
  content: string
  timestamp?: number            // momento do vídeo (opcional)
  isPrivate: boolean
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

// core/learning/domain/entities/WatchHistory.ts
export class WatchHistory {
  id: string
  userId: string
  lessonId: string
  courseId: string
  watchedAt: Date
  watchDuration: number         // segundos assistidos
  completed: boolean
  deviceInfo?: {
    type: 'mobile' | 'desktop' | 'tablet'
    os: string
  }
}
```

## 4. **CONTEXTO SALES (Vendas & Carrinho)**

```typescript
// core/sales/domain/entities/Cart.ts
export class Cart {
  id: string
  userId: string
  items: CartItem[]
  coupon?: Coupon
  
  // Totais
  subtotal: Money
  discount: Money
  total: Money
  
  // Status
  status: 'active' | 'converted' | 'abandoned'
  expiresAt: Date
  
  createdAt: Date
  updatedAt: Date
}

// core/sales/domain/entities/CartItem.ts
export class CartItem {
  id: string
  cartId: string
  courseId: string
  price: Money
  addedAt: Date
}

// core/sales/domain/entities/Order.ts
export class Order {
  id: string
  orderNumber: string           // human-readable (ex: ORD-2024-0001)
  userId: string
  items: OrderItem[]
  
  // Valores
  subtotal: Money
  discount: Money
  total: Money
  commissionTotal?: Money       // para afiliados
  
  // Status
  status: OrderStatus           // 'pending' | 'paid' | 'failed' | 'refunded'
  paymentStatus: PaymentStatus
  
  // Pagamento
  paymentMethod?: string
  paymentDetails?: any
  
  // Datas
  placedAt: Date
  paidAt?: Date
  canceledAt?: Date
  
  // Rastreamento
  metadata: {
    couponCode?: string
    affiliateId?: string
    utmSource?: string
    utmCampaign?: string
  }
}
```

## 5. **CONTEXTO PAYMENT (Pagamentos)**

```typescript
// core/payment/domain/entities/Transaction.ts
export class Transaction {
  id: string
  orderId: string
  gateway: 'stripe' | 'pagarme' | 'hotmart' | 'eduzz'
  gatewayTransactionId: string
  
  // Valores
  amount: Money
  fees: Money
  netAmount: Money
  
  // Status
  status: TransactionStatus
  statusHistory: StatusHistory[]
  
  // Método
  paymentMethod: {
    type: 'credit_card' | 'boleto' | 'pix' | 'bank_transfer'
    details: any                // masked card, boleto url, pix qr
  }
  
  // Parcelamento
  installments?: number
  installmentAmount?: Money
  
  // Datas
  processedAt: Date
  paidAt?: Date
  refundedAt?: Date
  createdAt: Date
}

// core/payment/domain/entities/Invoice.ts
export class Invoice {
  id: string
  transactionId: string
  invoiceNumber: string
  pdfUrl: string
  xmlUrl?: string               // para notas fiscais
  issuedAt: Date
}
```

## 6. **CONTEXTO MARKETING (Afiliados & Comissões)**

```typescript
// core/marketing/domain/entities/Affiliate.ts
export class Affiliate {
  id: string
  userId: string
  code: string                  // código único do afiliado
  
  // Comissões
  commissionRate: number        // percentual (ex: 0.3 = 30%)
  commissionType: 'percentage' | 'fixed'
  
  // Métricas
  totalSales: number
  totalCommission: Money
  pendingCommission: Money
  paidCommission: Money
  
  // Status
  status: 'active' | 'blocked' | 'pending'
  
  // Links
  referralLinks: ReferralLink[]
  
  createdAt: Date
  updatedAt: Date
}

// core/marketing/domain/entities/Commission.ts
export class Commission {
  id: string
  affiliateId: string
  orderId: string
  amount: Money
  rate: number
  status: 'pending' | 'approved' | 'paid' | 'canceled'
  paidAt?: Date
  createdAt: Date
}
```

## 7. **CONTEXTO COMMUNITY (Comunidade & Interação)**

```typescript
// core/community/domain/entities/ForumPost.ts
export class ForumPost {
  id: string
  courseId?: string
  lessonId?: string
  authorId: string
  
  title?: string                // para posts principais
  content: string
  
  // Relacionamentos
  parentId?: string             // para respostas
  replies: ForumPost[]
  
  // Interações
  likes: number
  reactions: Reaction[]
  isPinned: boolean
  isLocked: boolean
  
  // Status
  status: 'published' | 'hidden' | 'deleted'
  
  createdAt: Date
  updatedAt: Date
}

// core/community/domain/entities/Announcement.ts
export class Announcement {
  id: string
  courseId: string
  authorId: string
  title: string
  content: string
  priority: 'low' | 'medium' | 'high'
  sendEmail: boolean
  sentAt: Date
  expiresAt?: Date
}
```

## 📁 **ESTRUTURA DE BANCO DE DADOS (SQL)**

```sql
-- Esquema principal com relacionamentos

-- IAM Schema
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  email_verified_at TIMESTAMP,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  refresh_token TEXT UNIQUE,
  device_info JSONB,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Catalog Schema
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail TEXT,
  price_in_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  level VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  content JSONB,
  duration INTEGER DEFAULT 0,
  "order" INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Learning Schema
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  last_access_at TIMESTAMP,
  completed_at TIMESTAMP,
  UNIQUE(user_id, course_id)
);

CREATE TABLE watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  watched_at TIMESTAMP DEFAULT NOW(),
  watch_duration INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false
);

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp INTEGER,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sales Schema
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active',
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  price_in_cents INTEGER NOT NULL,
  added_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subtotal_in_cents INTEGER NOT NULL,
  discount_in_cents INTEGER DEFAULT 0,
  total_in_cents INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  metadata JSONB,
  placed_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP
);

-- Payment Schema
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  gateway VARCHAR(50) NOT NULL,
  gateway_transaction_id VARCHAR(255),
  amount_in_cents INTEGER NOT NULL,
  fees_in_cents INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'processing',
  payment_method JSONB,
  installments INTEGER DEFAULT 1,
  processed_at TIMESTAMP DEFAULT NOW()
);

-- Índices importantes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_watch_history_user ON watch_history(user_id, watched_at DESC);
CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
```

## 🔄 **RELAÇÕES ENTRE CONTEXTOS**

```typescript
// Como os contextos se comunicam (eventos)

// 1. Usuário se matricula (IAM → Learning)
eventBus.emit(new UserEnrolledEvent({
  userId: '123',
  courseId: '456',
  enrolledAt: new Date()
}))

// 2. Compra realizada (Sales → Payment → Learning)
eventBus.emit(new OrderPaidEvent({
  orderId: '789',
  userId: '123',
  courseIds: ['456', '789'],
  paidAt: new Date()
}))

// 3. Aula assistida (Learning → Analytics)
eventBus.emit(new LessonWatchedEvent({
  userId: '123',
  lessonId: '456',
  watchTime: 300,
  completed: true
}))
```

## 📈 **MODELAGEM DE DADOS PARA ANALYTICS**

```typescript
// core/analytics/domain/events/
export interface AnalyticsEvent {
  id: string
  userId: string
  eventType: string
  properties: Record<string, any>
  timestamp: Date
  
  // Contexto
  sessionId: string
  url?: string
  referrer?: string
  
  // Device
  device: {
    type: string
    browser: string
    os: string
  }
  
  // Geolocation
  location?: {
    country: string
    city: string
    ip: string
  }
}
```

Esta modelagem cobre:
- ✅ **Autenticação e usuários** (IAM)
- ✅ **Catálogo de cursos** (Catalog)
- ✅ **Progresso e aprendizado** (Learning)
- ✅ **Vendas e carrinho** (Sales)
- ✅ **Pagamentos e transações** (Payment)
- ✅ **Afiliados e marketing** (Marketing)
- ✅ **Comunidade e interação** (Community)
- ✅ **Analytics e eventos** (para BI)