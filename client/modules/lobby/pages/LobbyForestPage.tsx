import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useSocket } from '@/stores/socket';

export const LobbyForestPage = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnterForest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await socket.emitWithAck('forest:enter');
      if (res.error) {
        setError(res.message || 'Не удалось войти в лес');
      } else {
        navigate(`/forest/${res.forestId}`);
      }
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <Card header="Лес" className="m-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm">
            Лес - это PvE режим, где ты можешь собирать ресурсы и сражаться с монстрами.
          </p>

          <div className="border-2 border-dashed p-2">
            <h5 className="mb-2">Правила:</h5>
            <ul className="text-xs list-disc list-inside">
              <li>Здоровье сохраняется между боями</li>
              <li>Максимальное время: 15 минут</li>
              <li>Чем глубже ты пробираешься в лес - тем опаснее</li>
              <li>При смерти - дебафф на 1 час</li>
              <li>Любой выбор может обернуться неожиданным последствием</li>
            </ul>
          </div>

          <div className="border-2 border-dashed p-2">
            <h5 className="mb-2">Награды:</h5>
            <ul className="text-xs list-disc list-inside">
              <li>🐺 Волк - кожа</li>
              <li>🌳 Дерево - доски</li>
              <li>⛺ Лагерь - ткань</li>
              <li>🪤 Капкан - железо</li>
              <li>⚔️ Меч - сталь</li>
              <li>💎 Кристалл - арканит</li>
              <li>📦 Сундук - золото</li>
              <li>🔥 Костёр - восстановление HP</li>
            </ul>
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        </div>
      </Card>

      <div className="flex flex-col gap-2 mt-auto pb-8 px-4">
        <Button onClick={handleEnterForest} disabled={loading} className="is-primary">
          {loading ? 'Загрузка...' : 'Войти в лес'}
        </Button>
      </div>
    </div>
  );
};
