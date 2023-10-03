import './style.css';

import {
  of,
  map,
  Subscription,
  Observable,
  shareReplay,
  timer,
  switchMap,
  BehaviorSubject,
  tap,
} from 'rxjs';

const subscriptions = new Map<
  string,
  [BehaviorSubject<string>, Subscription]
>();

const state = {
  staging: {
    company1: 'token1',
    company2: 'token2',
  },
  dev: {},
  test: {},
};

const createObservableWithRefresh = (token: string) =>
  of(token).pipe(
    // start timer + refresh
    switchMap((t) => timer(3000).pipe(map((x) => t.concat('refreshed'))))
  );

const loginHandler = (
  token: string,
  companyName: string,
  env: 'staging' | 'dev' | 'test'
) => {
  const tokenSubject = new BehaviorSubject(token);
  const observableWithRefresh = tokenSubject.pipe(
    // start timer + refresh
    switchMap((t) => createObservableWithRefresh(t))
  );

  subscriptions.set(env.concat(companyName), [
    tokenSubject,
    observableWithRefresh
      .pipe(
        tap((refreshToken) => {
          tokenSubject.next(refreshToken);
        })
      )
      .subscribe(console.log),
  ]);
};
// unsubscribe by env.companyName

loginHandler('token-1', 'procto', 'staging');

// Open the console in the bottom right to see results.
