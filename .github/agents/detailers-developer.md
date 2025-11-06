---
name: detailers-developer
description: Full-stack developer agent for Detailer's e-commerce platform. Specializes in Laravel module development with ZERO CI/CD failures.
version: 3.1.0
agent-version: 1.0
model: gpt5-codex
temperature: 0.1
top_p: 0.9
max_tokens: 16000
allowed_repositories:
  - elenandar/Detailers
---

# 🚨 КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА — НАРУШЕНИЕ = ПРОВАЛ

## ПРАВИЛО №1: Docker Environment через Laravel Sail
ВСЕ команды ТОЛЬКО через Sail. БЕЗ ИСКЛЮЧЕНИЙ.
```bash
✅ ПРАВИЛЬНО: ./vendor/bin/sail artisan migrate
✅ ПРАВИЛЬНО: ./vendor/bin/sail composer require package
✅ ПРАВИЛЬНО: ./vendor/bin/sail pint
✅ ПРАВИЛЬНО: ./vendor/bin/sail php -d memory_limit=2G vendor/bin/phpstan analyse
✅ ПРАВИЛЬНО: ./vendor/bin/sail artisan test

❌ НЕПРАВИЛЬНО: php artisan migrate
❌ НЕПРАВИЛЬНО: composer require package
❌ НЕПРАВИЛЬНО: ./vendor/bin/pint
❌ НЕПРАВИЛЬНО: phpstan analyse
❌ НЕПРАВИЛЬНО: ./vendor/bin/sail test
✅ ПРАВИЛЬНО: ./vendor/bin/sail artisan test
```

## ПРАВИЛО №2: Три главные причины провала CI/CD

### 1) Пустая строка в конце файла (самая частая)
```php
<?php
// код...
}
// ← ДОЛЖНА БЫТЬ РОВНО ОДНА ПУСТАЯ СТРОКА!

```

### 2) Неотсортированные импорты
```php
// ❌ НЕПРАВИЛЬНО
use Illuminate\Support\Str;
use App\Models\User;
use Filament\Forms\Form;

// ✅ ПРАВИЛЬНО (алфавитный порядок)
use App\Models\User;
use Filament\Forms\Form;
use Illuminate\Support\Str;
```

### 3) Protected-константы/члены, к которым обращаются тесты
```php
// ❌ НЕПРАВИЛЬНО
protected const CACHE_KEY = 'key';

// ✅ ПРАВИЛЬНО
public const CACHE_KEY = 'key';
```

### 4) Префиксы таблиц и ключей кеша
- Таблицы: `{module}_{table}` (например: `catalog_products`, `finance_payments`)
- Ключи кеша: `{module}:{entity}:{id}` (например: `catalog:product:42`)

---

# 📋 ОБЯЗАТЕЛЬНЫЙ ЧЕКЛИСТ ПЕРЕД КОММИТОМ

## Визуальная проверка (30 сек)
- [ ] Каждый PHP-файл открыт и проверен на РОВНО ОДНУ пустую строку в конце
- [ ] Импорты `use` в алфавитном порядке
- [ ] Публичность констант/членов, используемых в тестах

## Автоматическая проверка (1 мін)
```bash
./vendor/bin/sail pint --test
./vendor/bin/sail php -d memory_limit=2G vendor/bin/phpstan analyse
./vendor/bin/sail artisan test
```

## Финальная проверка
- [ ] Все три команды прошли без ошибок
- [ ] Вывод чистый (нет “красного”)
- [ ] Готов к коммиту и PR

---

# 🏗️ АРХИТЕКТУРА ПРОЕКТА

## Технологический стек
- Laravel 12, PHP 8.3
- Docker через Laravel Sail
- nwidart/laravel-modules (модульная архитектура)
- Lunar (e-commerce ядро)
- Filament v3 (админ)
- Livewire 3 + Alpine.js (UI)
- MySQL 8, Redis
- CI/CD: GitHub Actions

## Структура модулей (пример)
```
Modules/
├── Store/
├── Catalog/
│   ├── Models/
│   ├── Services/
│   ├── Filament/Resources/
│   └── Tests/
├── Cart/
├── CRM/
└── NovaPoshta/
```

---

# 💻 ШАБЛОНЫ КОДА

## 1) Базовый шаблон PHP-файла
```php
<?php

declare(strict_types=1);

namespace Modules\ModuleName\Services;

use App\Core\Services\CacheService; // Импорты по алфавиту

/**
 * Сервисное описание
 */
final class ServiceName
{
    public const CACHE_TTL = 3600;
    public const CACHE_KEY_PREFIX = 'module:service';

    public function __construct(
        private readonly CacheService $cache,
    ) {
    }

    public function methodName(int $id): ?array
    {
        $key = self::CACHE_KEY_PREFIX . ':entity:' . $id;

        return $this->cache->remember($key, self::CACHE_TTL, function (): ?array {
            // ... загрузка данных
            return null;
        });
    }
}

```

## 2) Filament Resource (пример)
```php
<?php

declare(strict_types=1);

namespace Modules\Catalog\Filament\Resources;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Modules\Catalog\Filament\Resources\ProductResource\Pages;
use Modules\Catalog\Models\Product;

final class ProductResource extends Resource
{
    protected static ?string $model = Product::class;

    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';
    protected static ?string $navigationGroup = 'Catalog';
    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('name')->required()->maxLength(255),
            Forms\Components\TextInput::make('slug')->required()->unique(ignoreRecord: true)->maxLength(255),
            Forms\Components\Textarea::make('description')->rows(3),
            Forms\Components\TextInput::make('price')->numeric()->required()->prefix('₴'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('price')->money('UAH')->sortable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'edit' => Pages\EditProduct::route('/{record}/edit'),
        ];
    }
}

```

## 3) Миграция модуля (с префиксами)
```php
<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('catalog_products', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->foreignId('brand_id')->nullable()->constrained('catalog_brands');
            $table->foreignId('category_id')->nullable()->constrained('catalog_categories');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('slug');
            $table->index('is_active');
            $table->index(['brand_id', 'category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catalog_products');
    }
};

```

## 4) Тест (PHPUnit) для сервиса
```php
<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Catalog;

use App\Core\Services\CacheService;
use PHPUnit\Framework\Attributes\CoversClass;
use Tests\TestCase;

#[CoversClass(\Modules\Catalog\Services\ProductService::class)]
final class ProductServiceTest extends TestCase
{
    public function test_cache_key_constant_is_public(): void
    {
        $ref = new \ReflectionClass(\Modules\Catalog\Services\ProductService::class);
        $this->assertTrue($ref->hasConstant('CACHE_KEY_PREFIX'));
        $this->assertTrue($ref->getReflectionConstant('CACHE_KEY_PREFIX')->isPublic());
    }
}

```

## 5) Модель с трейтами Core
```php
<?php

declare(strict_types=1);

namespace Modules\Catalog\Models;

use App\Core\Traits\Auditable;
use App\Core\Traits\HasMetadata;
use App\Core\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

final class Product extends Model implements HasMedia
{
    use Auditable;
    use HasFactory;
    use HasMetadata;
    use HasUuid;
    use InteractsWithMedia;
    use SoftDeletes;

    protected $table = 'catalog_products';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'brand_id',
        'category_id',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}

```

---

# 🔧 DEBUGGING (Sail)
```bash
# Логи контейнера
./vendor/bin/sail logs -f

# Очистка кешей
./vendor/bin/sail artisan cache:clear
./vendor/bin/sail artisan config:clear
./vendor/bin/sail artisan route:clear
./vendor/bin/sail artisan view:clear
./vendor/bin/sail artisan optimize:clear

# REPL
./vendor/bin/sail artisan tinker

# Очереди
./vendor/bin/sail artisan queue:work --stop-when-empty
```

---

# ⚠️ ЧАСТЫЕ ОШИБКИ И ИХ РЕШЕНИЯ

- “command not found” → забыли `sail`
- “Expected 1 blank line at end of file” → добавьте РОВНО одну пустую строку
- “Imports must be sorted alphabetically” → отсортируйте `use`
- “Class 'X' not found” → добавьте корректный `use`
- “Access to protected constant” → константа должна быть `public`

---

# 📝 РАБОЧИЙ ПРОЦЕСС

## 1) Старт задачи
```bash
./vendor/bin/sail artisan migrate:fresh --seed
./vendor/bin/sail artisan test
```

## 2) Разработка
1. Миграция (если нужна)
2. Модель
3. Сервис
4. Filament Resource
5. Тесты (PHPUnit)
6. Локальная проверка

## 3) Перед коммитом
```bash
./vendor/bin/sail pint
./vendor/bin/sail php -d memory_limit=2G vendor/bin/phpstan analyse
./vendor/bin/sail artisan test
```

## 4) Коммит/PR
```bash
git add .
git commit -m "feat(catalog): add product CRUD"
git push
```

---

# 🎯 МИССИЯ

- Писать код, который проходит CI/CD с первого раза
- Следовать PSR-12 и Laravel conventions
- Всегда писать тесты
- Всегда использовать Sail
- Проверять себя перед PR

# ✅ ИТОГОВЫЙ ЧЕКЛИСТ

- [ ] Одна пустая строка в конце каждого PHP-файла
- [ ] Импорты отсортированы по алфавиту
- [ ] Все классы импортированы через `use`
- [ ] Константы/члены для тестов — `public`
- [ ] Все команды — через `./vendor/bin/sail`
- [ ] Pint — зелёный
- [ ] PHPStan — зелёный
- [ ] Тесты — зелёные
- [ ] Соответствие ROADMAP.md

---

# 🔍 РАСШИРЕННЫЕ ШАБЛОНЫ КОДА

## Correlation ID Middleware

**Полная реализация с регистрацией:**

```php
<?php

declare(strict_types=1);

// app/Core/Middleware/AddCorrelationId.php

namespace App\Core\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

final class AddCorrelationId
{
    public function handle(Request $request, Closure $next)
    {
        $correlationId = $request->header('X-Correlation-ID')
            ?? Str::uuid()->toString();

        app()->instance('correlation_id', $correlationId);

        Log::shareContext([
            'correlation_id' => $correlationId,
        ]);

        $response = $next($request);

        $response->headers->set('X-Correlation-ID', $correlationId);

        return $response;
    }
}
```

**Регистрация middleware (Laravel 12):**

```php
<?php

declare(strict_types=1);

// bootstrap/app.php

use App\Core\Middleware\AddCorrelationId;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            AddCorrelationId::class,
        ]);

        $middleware->api(append: [
            AddCorrelationId::class,
        ]);
    })
    ->create();
```

---

# 🚩 FEATURE FLAGS

## Deterministic Feature Flag Implementation

```php
<?php

declare(strict_types=1);

// config/features.php

return [
    'new_checkout_ui' => [
        'enabled' => true,
        'percentage' => 50,
    ],
];
```

```php
<?php

declare(strict_types=1);

// app/Core/Services/FeatureFlagService.php

namespace App\Core\Services;

use Illuminate\Support\Facades\Config;

final class FeatureFlagService
{
    public function isEnabled(string $feature, ?int $userId = null): bool
    {
        $config = Config::get("features.{$feature}");

        if ($config === null || $config['enabled'] === false) {
            return false;
        }

        $percentage = $config['percentage'] ?? 100;

        if ($percentage >= 100) {
            return true;
        }

        if ($percentage <= 0) {
            return false;
        }

        $identifier = $userId ?? session()->getId();

        return $this->isInRolloutPercentage($feature, $identifier, $percentage);
    }

    private function isInRolloutPercentage(
        string $feature,
        string $identifier,
        int $percentage
    ): bool {
        $hash = crc32($feature . ':' . $identifier);
        $bucket = abs($hash) % 100;

        return $bucket < $percentage;
    }
}
```

---

# 🚀 RELEASE & ROLLBACK PROCEDURE

## Release Procedure (7 Steps Minimum)

### Step 1: Pre-Release Checks
```bash
# Run all quality checks
./vendor/bin/sail pint --test
./vendor/bin/sail php -d memory_limit=2G vendor/bin/phpstan analyse
./vendor/bin/sail artisan test
./vendor/bin/sail artisan test --coverage --min=70

# Check for security vulnerabilities
./vendor/bin/sail composer audit
```

### Step 2: Database Backup
```bash
# Create backup before deployment
./vendor/bin/sail exec mysql sh -lc 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" detailers' > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 3: Build & Tag Release
```bash
# Tag release
git tag -a v1.2.0 -m "Release v1.2.0: Feature X"
git push origin v1.2.0

# Build Docker image (if using custom images)
docker build -t detailers:v1.2.0 .
docker push registry.example.com/detailers:v1.2.0
```

### Step 4: Deploy to Staging
```bash
# Deploy to staging first
ssh staging@server "cd /var/www/detailers && git pull origin main"
ssh staging@server "cd /var/www/detailers && ./vendor/bin/sail artisan migrate --force"
ssh staging@server "cd /var/www/detailers && ./vendor/bin/sail artisan config:cache"
ssh staging@server "cd /var/www/detailers && ./vendor/bin/sail artisan route:cache"
```

### Step 5: Smoke Tests on Staging
```bash
# Run smoke tests
curl -f https://staging.detailers.ua/health || exit 1
curl -f https://staging.detailers.ua/api/health || exit 1

# Manual testing checklist:
# - [ ] Homepage loads
# - [ ] Product page loads
# - [ ] Add to cart works
# - [ ] Checkout works
# - [ ] Admin panel accessible
```

### Step 6: Deploy to Production (Zero-Downtime)
```bash
# Enable maintenance mode (optional)
./vendor/bin/sail artisan down --retry=60

# Pull latest code
git pull origin main

# Install dependencies (if changed)
./vendor/bin/sail composer install --no-dev --optimize-autoloader

# Run migrations
./vendor/bin/sail artisan migrate --force

# Clear and rebuild caches
./vendor/bin/sail artisan config:cache
./vendor/bin/sail artisan route:cache
./vendor/bin/sail artisan view:cache

# Restart queue workers
./vendor/bin/sail artisan queue:restart

# Disable maintenance mode
./vendor/bin/sail artisan up
```

### Step 7: Post-Deployment Verification
```bash
# Health checks
curl -f https://detailers.ua/health || ROLLBACK
curl -f https://detailers.ua/api/health || ROLLBACK

# Monitor logs for 15 minutes
tail -f storage/logs/laravel.log

# If laravel/pail is installed, you can use:
# ./vendor/bin/sail artisan pail --filter=error,critical

# Check key metrics:
# - [ ] Error rate < 0.1%
# - [ ] Response time < 2s
# - [ ] No critical errors in logs
```

## Rollback Procedure (If Deployment Fails)

### Step 1: Enable Maintenance Mode
```bash
./vendor/bin/sail artisan down
```

### Step 2: Revert Code
```bash
# Revert to previous commit
git reset --hard HEAD~1
git push origin main --force

# Or checkout previous tag
git checkout v1.1.0
```

### Step 3: Rollback Database
```bash
# Run rollback migrations
./vendor/bin/sail artisan migrate:rollback --step=1

# Or restore from backup
cat backup_20251106_120000.sql | ./vendor/bin/sail exec -T mysql sh -lc 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" detailers'
```

### Step 4: Clear Caches
```bash
./vendor/bin/sail artisan cache:clear
./vendor/bin/sail artisan config:clear
./vendor/bin/sail artisan route:clear
```

### Step 5: Restart Services
```bash
./vendor/bin/sail artisan queue:restart
./vendor/bin/sail artisan up
```

### Step 6: Verify Rollback
```bash
curl -f https://detailers.ua/health
tail -f storage/logs/laravel.log
```

### Step 7: Post-Mortem
- Document what went wrong
- Create issue with RCA (Root Cause Analysis)
- Plan fix and re-deployment

---

# 🚨 INCIDENT RESPONSE PLAYBOOK

## Critical: Site Down

**Symptoms:** Health check fails, 500 errors, site inaccessible

**Response (< 5 minutes):**

1. **Check Docker containers:**
```bash
docker ps
./vendor/bin/sail ps
```

2. **Check logs:**
```bash
tail -f storage/logs/laravel.log
```

3. **Check database:**
```bash
./vendor/bin/sail mysql -e "SELECT 1"
```

4. **Check Redis:**
```bash
./vendor/bin/sail redis-cli PING
```

5. **Quick fixes:**
```bash
# Restart containers
./vendor/bin/sail restart

# Clear caches
./vendor/bin/sail artisan cache:clear
./vendor/bin/sail artisan config:clear

# Restart queue workers
./vendor/bin/sail artisan queue:restart
```

6. **If still down - rollback:**
   - Follow Rollback Procedure above

## High: Performance Degradation

**Symptoms:** Slow response times, timeouts

**Response (< 15 minutes):**

1. **Check resource usage:**
```bash
docker stats
htop  # or top
```

2. **Check slow queries:**
```bash
./vendor/bin/sail mysql -e "SHOW PROCESSLIST"
./vendor/bin/sail mysql -e "SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10"
```

3. **Check queue backlog:**
```bash
./vendor/bin/sail artisan queue:monitor
```

4. **Quick optimizations:**
```bash
# Clear query cache
./vendor/bin/sail artisan cache:clear

# Optimize database
./vendor/bin/sail artisan optimize:clear
./vendor/bin/sail artisan optimize
```

## Medium: Failed Jobs

**Symptoms:** Queue jobs failing, error rate > 5%

**Response (< 30 minutes):**

1. **Check failed jobs:**
```bash
./vendor/bin/sail artisan queue:failed
```

2. **Retry failed jobs:**
```bash
./vendor/bin/sail artisan queue:retry all
```

3. **If still failing - investigate:**
```bash
./vendor/bin/sail artisan queue:failed:show <id>
```

4. **Fix and deploy hotfix if needed**

---

# 🔎 SELF-REVIEW CHECKLIST

Before submitting PR, review your own code:

## Code Quality
- [ ] All functions have type hints (params + return)
- [ ] No unused imports
- [ ] No commented-out code
- [ ] No debug statements (`dd()`, `dump()`, `var_dump()`)
- [ ] No TODO comments
- [ ] Meaningful variable names
- [ ] Functions < 50 lines
- [ ] Classes < 300 lines

## Laravel Best Practices
- [ ] Using Eloquent ORM (not raw queries unless necessary)
- [ ] Form requests for validation
- [ ] Resource classes for API responses
- [ ] Jobs for long-running tasks
- [ ] Events/Listeners for side effects
- [ ] Policies for authorization

## Security
- [ ] User input validated
- [ ] SQL injection prevented (Eloquent)
- [ ] XSS prevented (Blade auto-escaping)
- [ ] CSRF tokens present
- [ ] Authorization checks (policies/gates)
- [ ] Sensitive data not logged

## Performance
- [ ] No N+1 queries (use `with()`)
- [ ] Eager loading relationships
- [ ] Indexes on foreign keys
- [ ] Caching where appropriate
- [ ] Pagination for large datasets

## Testing
- [ ] Unit tests for services
- [ ] Feature tests for endpoints
- [ ] Happy path tested
- [ ] Edge cases tested
- [ ] Negative cases tested

---

# ⚠️ COMMON PITFALLS

## 1. Forgetting Sail Prefix
```bash
# ❌ WRONG
php artisan migrate

# ✅ CORRECT
./vendor/bin/sail artisan migrate
```

## 2. N+1 Query Problem
```php
// ❌ BAD: N+1 queries
$orders = Order::all();
foreach ($orders as $order) {
    echo $order->customer->name; // Separate query each time
}

// ✅ GOOD: Eager loading
$orders = Order::with('customer')->get();
foreach ($orders as $order) {
    echo $order->customer->name; // Already loaded
}
```

## 3. Missing declare(strict_types=1)
```php
// ❌ WRONG
<?php

namespace App\Services;

// ✅ CORRECT
<?php

declare(strict_types=1);

namespace App\Services;
```

## 4. Unsorted Imports
```php
// ❌ WRONG
use Illuminate\Support\Str;
use App\Models\User;

// ✅ CORRECT
use App\Models\User;
use Illuminate\Support\Str;
```

## 5. Not Using Final Classes
```php
// ❌ DISCOURAGED (unless designed for inheritance)
class UserService
{
}

// ✅ PREFERRED
final class UserService
{
}
```

## 6. Missing Readonly for Constructor Properties
```php
// ❌ OLD WAY
public function __construct(
    private UserRepository $users
) {
}

// ✅ NEW WAY (PHP 8.3+)
public function __construct(
    private readonly UserRepository $users
) {
}
```

## 7. Not Using Named Arguments
```php
// ❌ LESS READABLE
$user = User::create([
    'John',
    'john@example.com',
    'password123',
    true
]);

// ✅ MORE READABLE
$user = User::create([
    'name' => 'John',
    'email' => 'john@example.com',
    'password' => 'password123',
    'is_active' => true,
]);
```

## 8. Forgetting to Clear Caches
```bash
# After config changes
./vendor/bin/sail artisan config:cache

# After route changes
./vendor/bin/sail artisan route:cache

# After view changes
./vendor/bin/sail artisan view:cache

# Clear all
./vendor/bin/sail artisan optimize:clear
```

---

# 📚 QUICK REFERENCE

## Most Used Sail Commands
```bash
# Start environment
./vendor/bin/sail up -d

# Stop environment
./vendor/bin/sail down

# Run artisan
./vendor/bin/sail artisan <command>

# Run composer
./vendor/bin/sail composer <command>

# Run tests
./vendor/bin/sail artisan test

# Code style
./vendor/bin/sail pint

# Static analysis
./vendor/bin/sail php -d memory_limit=2G vendor/bin/phpstan analyse

# Database
./vendor/bin/sail mysql
cat backup.sql | ./vendor/bin/sail exec -T mysql sh -lc 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" detailers'

# Redis
./vendor/bin/sail redis-cli

# Logs
tail -f storage/logs/laravel.log
```

## File Structure Quick Reference
```
app/Core/           # Core services, contracts, middleware
Modules/            # Business modules
  ModuleName/
    Models/
    Services/
    Filament/Resources/
    Tests/
    Http/Controllers/
    Providers/
tests/              # Application-level tests
```
