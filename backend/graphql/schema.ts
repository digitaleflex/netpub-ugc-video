import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  type Comment {
    id: ID!
    content: String!
    anonymousId: String
    createdAt: String!
    updatedAt: String!
    user: User
    project: Project!
    parent: Comment
    replies: [Comment!]!
  }

  type Like {
    id: ID!
    createdAt: String!
    user: User
    project: Project!
    anonymousId: String
  }

  type Conversation {
    id: ID!
    userId: String
    userName: String
    createdAt: String!
    hasAppointment: Boolean
    hasOrderPlaced: Boolean
    hasCallScheduled: Boolean
    lastActivity: String!
    updatedAt: String!
    messages: [ChatMessage!]!
    appointments: [Appointment!]!
    orders: [Order!]!
    discovery: String
    feedback: String
    user: User
  }

  type ChatMessage {
    id: ID!
    sender: String!
    text: String!
    timestamp: String!
    conversationId: ID!
  }

  type Order {
    id: ID!
    clientName: String!
    type: String!
    status: String!
    date: String!
    conversationId: ID!
    conversation: Conversation
  }

  type Appointment {
    id: ID!
    clientName: String!
    date: String!
    time: String!
    service: String!
    status: String!
    conversationId: ID!
    conversation: Conversation
  }

  type Project {
    id: ID!
    title: String!
    description: String
    videoUrl: String
    imageUrl: String
    category: String!
    featured: Boolean!
    createdAt: String!
    updatedAt: String!
    user: User!
    comments: [Comment!]!
    likes: [Like!]!
    likeCount: Int!
    commentCount: Int!
  }

  type Trend {
    value: Float!
    isUp: Boolean!
  }

  type DashboardStats {
    totalConversations: Int!
    activeConversations: Int!
    totalAppointments: Int!
    pendingAppointments: Int!
    confirmedAppointments: Int!
    completedAppointments: Int!
    totalOrders: Int!
    pendingOrders: Int!
    confirmedOrders: Int!
    deliveredOrders: Int!
    totalComments: Int!
    totalLikes: Int!
    recentConversations: [Conversation!]!
    recentAppointments: [Appointment!]!
    recentOrders: [Order!]!
    recentComments: [Comment!]!
    recentLikes: [Like!]!
    conversationsTrend: Trend
    appointmentsTrend: Trend
    ordersTrend: Trend
    engagementTrend: Trend
  }

  type AnalyticsStats {
    totalMessages: Int!
    totalAppointments: Int!
    totalOrders: Int!
    conversionRate: Float!
    mostFrequentIntentions: [Intention!]!
    messagesTrend: Trend
    appointmentsTrend: Trend
    ordersTrend: Trend
    conversionTrend: Trend
    systemLatency: Float!
    systemStatus: String!
    efficiencyScore: Float!
  }

  type Intention {
    name: String!
    count: Int!
    icon: String!
  }

  type PaginatedOrders {
    orders: [Order!]!
    totalCount: Int!
  }

  type PaginatedAppointments {
    appointments: [Appointment!]!
    totalCount: Int!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  # Queries
  type Query {
    # User queries
    me: User
    users: [User!]!

    # Project queries
    projects: [Project!]!
    project(id: ID!): Project
    projectsByCategory(category: String!): [Project!]!

    # Comment queries
    comments(projectId: ID!): [Comment!]!

    # Like queries
    likes(projectId: ID!): [Like!]!

    # Dashboard queries
    dashboardStats: DashboardStats!
    analyticsStats: AnalyticsStats!
    conversations(limit: Int, offset: Int): [Conversation!]!
    conversation(id: ID!): Conversation
    allOrders(limit: Int, offset: Int, status: String, date: String): PaginatedOrders!
    allAppointments(limit: Int, offset: Int, status: String, date: String): PaginatedAppointments!
  }

  # Mutations
  type Mutation {
    # Auth mutations
    login(email: String!, password: String!): AuthPayload!
    register(email: String!, password: String!, name: String): AuthPayload!
    createAdminUser: User
    createConversation: Conversation!

    updateConversation(
      conversationId: String!
      clientName: String
      clientEmail: String
      clientPhone: String
      discovery: String
      feedback: String
    ): Conversation!

    createAppointment(
      conversationId: String!
      service: String!
      date: String!
      time: String!
      clientName: String
      clientEmail: String
      clientPhone: String
    ): Appointment!

    createOrder(
      conversationId: String!
      service: String!
      details: String!
      clientName: String
      clientEmail: String
      clientPhone: String
    ): Order!







    # Contact mutations
    sendContactMessage(
      name: String!
      email: String!
      company: String
      service: String
      message: String!
    ): Boolean!

    # Comment mutations
    addComment(
      projectId: ID!
      content: String!
      anonymousId: String
    ): Comment!

    addReply(
      parentId: ID!
      content: String!
      userIdentifier: String
    ): Comment!

    # Like mutations
    addLike(
      projectId: ID!
      anonymousId: String
    ): Like!

    removeLike(
      projectId: ID!
      anonymousId: String
    ): Boolean!

    # Dashboard mutations
    updateAppointmentStatus(appointmentId: ID!, status: String!): Boolean!
    updateOrderStatus(orderId: ID!, status: String!): Boolean!
    resetChatbotModel: Boolean!
    deleteConversation(conversationId: ID!): Boolean!
    addNoteToConversation(conversationId: ID!, note: String!): Boolean!
    addChatMessage(conversationId: ID!, sender: String!, text: String!): ChatMessage!
    exportAllData: Boolean!
  }
`;