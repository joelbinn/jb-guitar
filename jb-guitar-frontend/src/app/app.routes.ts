import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing/landing.page';
import { PracticeListPage } from './pages/practice-list/practice-list.page';
import { SessionPage } from './pages/session/session.page';
import { CreatePage } from './pages/create/create.page';
import { ExerciseEditPage } from './pages/exercise-edit/exercise-edit.page';
import { PlanEditPage } from './pages/plan-edit/plan-edit.page';

export const routes: Routes = [
    { path: '', component: LandingPage },
    { path: 'practice', component: PracticeListPage },
    { path: 'practice/:id', component: SessionPage },
    { path: 'create', component: CreatePage },
    { path: 'create/exercise/:id', component: ExerciseEditPage },
    { path: 'create/plan/:id', component: PlanEditPage },
    { path: '**', redirectTo: '' },
];
