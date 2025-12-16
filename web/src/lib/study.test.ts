import { gradeCard, Rating } from './study';
import { supabase } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn(),
    },
}));

describe('gradeCard', () => {
    const mockCardId = 'test-card-id';
    const mockDeckId = 'test-deck-id';
    const mockUserId = 'test-user-id';

    const mockDbCard = {
        id: mockCardId,
        deck_id: mockDeckId,
        front: 'Front',
        back: 'Back',
        fsrs_data: {
            due: new Date().toISOString(),
            stability: 1,
            difficulty: 1,
            elapsed_days: 0,
            scheduled_days: 0,
            reps: 0,
            lapses: 0,
            state: 0, // New
            last_review: null
        },
        state: 'new',
    };

    const mockUpdatedCard = {
        ...mockDbCard,
        state: 'learning',
        fsrs_data: { ...mockDbCard.fsrs_data, state: 1 } // Learning
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should calculate schedule and update card', async () => {
        // Setup Mocks
        const mockSelect = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockSingle = jest.fn();
        const mockUpdate = jest.fn().mockReturnThis();
        const mockInsert = jest.fn().mockReturnThis();

        (supabase.from as jest.Mock).mockImplementation((table) => {
            if (table === 'cards') {
                return {
                    select: mockSelect,
                    update: mockUpdate,
                    eq: mockEq,
                    single: mockSingle,
                };
            }
            if (table === 'decks') {
                return {
                    select: mockSelect,
                    eq: mockEq,
                    single: mockSingle.mockResolvedValue({ data: { user_id: mockUserId }, error: null }),
                };
            }
            if (table === 'review_logs') {
                return {
                    insert: mockInsert,
                };
            }
            return { select: jest.fn() };
        });

        // Mock return values
        mockSingle
            .mockResolvedValueOnce({ data: mockDbCard, error: null }) // 1. Fetch Card
            .mockResolvedValueOnce({ data: mockUpdatedCard, error: null }); // 2. Update Card (result)

        // Execute
        const result = await gradeCard(mockCardId, Rating.Good);

        // Verify
        expect(supabase.from).toHaveBeenCalledWith('cards');
        expect(mockUpdate).toHaveBeenCalled();
        expect(supabase.from).toHaveBeenCalledWith('review_logs');
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            card_id: mockCardId,
            rating: Rating.Good,
            // ease_factor check might be flaky if we don't mock FSRS exact output, but let's check basic
        }));
        expect(result).toEqual(mockUpdatedCard);
    });
});
