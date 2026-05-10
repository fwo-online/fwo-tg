import type { Character, Contract } from '@fwo/shared';
import { useEffect, useState } from 'react';
import { claimContract, getContracts } from '@/api/contracts';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import { usePopup } from '@/hooks/usePopup';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';

const contractTypeNames: Record<string, string> = {
  damage: 'Нанести урона',
  kills: 'Убить противников',
  heal: 'Исцелить HP',
  useAbility: 'Использовать способности',
  forestLocations: 'Пройти локаций',
};

const tierLabels: Record<number, string> = {
  1: 'Лёгкий',
  2: 'Средний',
  3: 'Сложный',
};

export function ContractsModal() {
  const [open, setOpen] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [claimingIdx, setClaimingIdx] = useState<number | null>(null);
  const popup = usePopup();
  const { syncCharacter } = useSyncCharacter();

  useEffect(() => {
    if (open) {
      setLoading(true);
      getContracts()
        .then(setContracts)
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleClaim = async (index: number) => {
    setClaimingIdx(index);
    try {
      const result = await claimContract(index);
      setContracts((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], claimed: true };
        return updated;
      });

      popup.info({ message: 'Награда получена!' });
      await syncCharacter();
    } catch (err) {
      console.error('Failed to claim contract:', err);
    } finally {
      setClaimingIdx(null);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button className="flex-1" onClick={() => setOpen(!open)}>
          Контракты
        </Button>
      }
    >
      <Card header="Ежедневные контракты">
        <div className="flex flex-col gap-2">
          {loading && <div className="text-sm text-center py-4">Загрузка...</div>}

          {!loading &&
            contracts.map((contract, idx) => {
              const progressPercent =
                contract.goal > 0
                  ? Math.min(100, Math.round((contract.progress / contract.goal) * 100))
                  : 0;
              const canClaim = contract.progress >= contract.goal && !contract.claimed;

              return (
                <Card key={idx} className="text-sm">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span>{contractTypeNames[contract.type] ?? contract.type}</span>
                    <span className="text-xs opacity-70">{tierLabels[contract.tier]}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs opacity-70">
                      <span>
                        {contract.progress} / {contract.goal}
                      </span>
                      <span>
                        +{contract.exp} XP +{contract.gold}💰
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      {contract.claimed ? (
                        <span className="text-green-500">✅</span>
                      ) : canClaim ? (
                        <Button
                          className="is-primary text-xs"
                          disabled={claimingIdx === idx}
                          onClick={() => handleClaim(idx)}
                        >
                          {claimingIdx === idx ? '...' : 'Забрать'}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </Card>
              );
            })}

          {!loading && contracts.length === 0 && (
            <div className="text-sm text-center py-4 opacity-50">Контракты не найдены</div>
          )}
        </div>
      </Card>
    </Modal>
  );
}
