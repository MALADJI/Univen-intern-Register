import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { AuthService } from './auth.service';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

/**
 * WebSocket service for real-time updates
 * Connects to Spring Boot WebSocket endpoint and broadcasts updates
 */
@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: any = null;
  private connected: boolean = false;
  private connectionSubject = new BehaviorSubject<boolean>(false);
  private messageSubject = new Subject<WebSocketMessage>();

  // Observable streams for different event types
  public leaveRequestUpdates$ = new Subject<WebSocketMessage>();
  public adminUpdates$ = new Subject<WebSocketMessage>();
  public internUpdates$ = new Subject<WebSocketMessage>();
  public supervisorUpdates$ = new Subject<WebSocketMessage>();
  public attendanceUpdates$ = new Subject<WebSocketMessage>();
  public userUpdates$ = new Subject<WebSocketMessage>();
  public departmentUpdates$ = new Subject<WebSocketMessage>();

  constructor(private authService: AuthService) {
    // Auto-connect when service is created (if user is logged in)
    if (this.authService.isAuthenticated()) {
      this.connect();
    }
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.connected || this.stompClient) {
      console.log('WebSocket already connected or connecting...');
      return;
    }

    try {
      const socket = new SockJS('http://localhost:8082/ws');
      this.stompClient = Stomp.over(socket);

      // Disable debug logging (set to empty function)
      this.stompClient.debug = () => {};

      this.stompClient.connect({}, (frame: any) => {
        console.log('✅ WebSocket connected:', frame);
        this.connected = true;
        this.connectionSubject.next(true);

        // Subscribe to all update channels
        this.subscribeToChannels();
      }, (error: any) => {
        console.error('❌ WebSocket connection error:', error);
        this.connected = false;
        this.connectionSubject.next(false);
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.connect(), 5000);
      });
    } catch (error) {
      console.error('❌ Error creating WebSocket connection:', error);
      this.connected = false;
      this.connectionSubject.next(false);
    }
  }

  /**
   * Subscribe to all update channels
   */
  private subscribeToChannels(): void {
    // Leave Requests
    this.stompClient.subscribe('/topic/leave-requests', (message: any) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.body);
        console.log('📨 Received leave request update:', data);
        this.leaveRequestUpdates$.next(data);
        this.messageSubject.next(data);
      } catch (error) {
        console.error('Error parsing leave request message:', error);
      }
    });

    // Admins
    this.stompClient.subscribe('/topic/admins', (message: any) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.body);
        console.log('📨 Received admin update:', data);
        this.adminUpdates$.next(data);
        this.messageSubject.next(data);
      } catch (error) {
        console.error('Error parsing admin message:', error);
      }
    });

    // Interns
    this.stompClient.subscribe('/topic/interns', (message: any) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.body);
        console.log('📨 Received intern update:', data);
        this.internUpdates$.next(data);
        this.messageSubject.next(data);
      } catch (error) {
        console.error('Error parsing intern message:', error);
      }
    });

    // Supervisors
    this.stompClient.subscribe('/topic/supervisors', (message: any) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.body);
        console.log('📨 Received supervisor update:', data);
        this.supervisorUpdates$.next(data);
        this.messageSubject.next(data);
      } catch (error) {
        console.error('Error parsing supervisor message:', error);
      }
    });

    // Attendance
    this.stompClient.subscribe('/topic/attendance', (message: any) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.body);
        console.log('📨 Received attendance update:', data);
        this.attendanceUpdates$.next(data);
        this.messageSubject.next(data);
      } catch (error) {
        console.error('Error parsing attendance message:', error);
      }
    });

    // Users
    this.stompClient.subscribe('/topic/users', (message: any) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.body);
        console.log('📨 Received user update:', data);
        this.userUpdates$.next(data);
        this.messageSubject.next(data);
      } catch (error) {
        console.error('Error parsing user message:', error);
      }
    });

    // Departments
    this.stompClient.subscribe('/topic/departments', (message: any) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.body);
        console.log('📨 Received department update:', data);
        this.departmentUpdates$.next(data);
        this.messageSubject.next(data);
      } catch (error) {
        console.error('Error parsing department message:', error);
      }
    });

    console.log('✅ Subscribed to all WebSocket channels');
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect(() => {
        console.log('🔌 WebSocket disconnected');
        this.connected = false;
        this.connectionSubject.next(false);
      });
      this.stompClient = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get connection status observable
   */
  getConnectionStatus$(): Observable<boolean> {
    return this.connectionSubject.asObservable();
  }

  /**
   * Get all messages observable
   */
  getMessages$(): Observable<WebSocketMessage> {
    return this.messageSubject.asObservable();
  }
}


