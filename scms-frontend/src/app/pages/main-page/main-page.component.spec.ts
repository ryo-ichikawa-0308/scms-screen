import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainPageComponent } from './main-page.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/bff/auth/auth.service';
import { By } from '@angular/platform-browser';
import { EMPTY, of } from 'rxjs';

// AuthServiceのモック
const mockAuthService = {
  logout: jasmine.createSpy('logout'),
};

// Routerのモック
const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
  serializeUrl: jasmine.createSpy('serializeUrl'),
  createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue('mockUrlTree'),
  events: EMPTY,
  url: '',
  routerState: { snapshot: { root: {} } } as any,
};

const mockActivatedRoute = {
  snapshot: {
    root: {
      url: of([]),
      params: {},
      queryParams: {},
      fragment: '',
      data: {},
      children: [],
    },
  } as any,
  url: of([]),
};

describe('MainPageComponent', () => {
  let component: MainPageComponent;
  let fixture: ComponentFixture<MainPageComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainPageComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainPageComponent);
    component = fixture.componentInstance;

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    const injectedRouter = TestBed.inject(Router);
    router = injectedRouter as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });
  afterEach(() => {
    mockAuthService.logout.calls.reset();
  });

  it('✅ コンポーネントが正常に作成されること', () => {
    expect(component).toBeTruthy();
  });

  describe('logout', () => {
    it('✅ logout() が呼ばれたとき、AuthService.logout() が呼ばれること', () => {
      component.logout();
      expect(authService.logout).toHaveBeenCalledTimes(1);
    });

    it('✅ logout() が呼ばれたとき、ログイン画面へ遷移すること', () => {
      component.logout();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  it('✅ ツールバーのログアウトボタンがクリックされたとき、logout() メソッドが呼ばれること', () => {
    spyOn(component, 'logout');
    const logoutButton = fixture.debugElement.query(By.css('mat-toolbar button:last-child'));

    expect(logoutButton).toBeTruthy();
    logoutButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.logout).toHaveBeenCalledTimes(1);
  });
});
